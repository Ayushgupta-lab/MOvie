import crypto from 'crypto';
import mongoose from 'mongoose';
import { Show, IShow } from '../models/Show.js';
import { Screen, IScreen } from '../models/Screen.js';
import { SeatHold, ISeatHold } from '../models/SeatHold.js';
import { config } from '../config/env.js';

export interface SeatStatus {
  id: string;
  row: string;
  number: number;
  category: string;
  type: 'regular' | 'wheelchair' | 'companion' | 'empty';
  price: number;
  status: 'available' | 'held' | 'sold';
  isHeldByMe?: boolean;
}

export const getSeatAvailabilityForShow = async (
  showId: string,
  userId?: string
): Promise<{
  show: IShow;
  screen: IScreen;
  seats: SeatStatus[];
  categories: { name: string; price: number }[];
  summary: { total: number; available: number; held: number; sold: number };
}> => {
  const show = await Show.findById(showId);
  if (!show) {
    throw new Error('Show not found');
  }

  const screen = await Screen.findById(show.screenId);
  if (!screen) {
    throw new Error('Screen not found for this show');
  }

  const now = new Date();
  // Fetch active, unexpired holds
  const activeHolds = await SeatHold.find({
    showId: show._id,
    status: 'active',
    expiresAt: { $gt: now },
  });

  const heldSeatIds = new Set<string>();
  const userHeldSeatIds = new Set<string>();

  for (const hold of activeHolds) {
    for (const seatId of hold.seatIds) {
      heldSeatIds.add(seatId);
      if (userId && hold.userId.toString() === userId) {
        userHeldSeatIds.add(seatId);
      }
    }
  }

  const soldSeatIds = new Set<string>(show.soldSeats || []);

  const showPriceMap = new Map<string, number>();
  for (const p of show.pricing) {
    showPriceMap.set(p.category, p.price);
  }

  let availableCount = 0;
  let heldCount = 0;
  let soldCount = 0;

  const seats: SeatStatus[] = screen.seatLayout.seats.map((seat) => {
    let status: 'available' | 'held' | 'sold' = 'available';

    if (soldSeatIds.has(seat.id)) {
      status = 'sold';
      soldCount++;
    } else if (heldSeatIds.has(seat.id)) {
      status = 'held';
      heldCount++;
    } else if (seat.type !== 'empty') {
      availableCount++;
    }

    const price = showPriceMap.get(seat.category) ?? seat.price;

    return {
      id: seat.id,
      row: seat.row,
      number: seat.number,
      category: seat.category,
      type: seat.type,
      price,
      status,
      isHeldByMe: userHeldSeatIds.has(seat.id),
    };
  });

  const categories = screen.seatLayout.categories.map((c) => ({
    name: c.name,
    price: showPriceMap.get(c.name) ?? c.basePrice,
  }));

  return {
    show,
    screen,
    seats,
    categories,
    summary: {
      total: screen.totalSeats,
      available: availableCount,
      held: heldCount,
      sold: soldCount,
    },
  };
};

export const createSeatHold = async (
  showId: string,
  userId: string,
  seatIds: string[]
): Promise<{
  holdToken: string;
  expiresAt: Date;
  seatIds: string[];
  holdMinutes: number;
}> => {
  if (!seatIds || seatIds.length === 0) {
    throw new Error('Please select at least one seat');
  }

  if (seatIds.length > 10) {
    throw new Error('Maximum 10 seats can be booked in a single transaction');
  }

  const show = await Show.findById(showId);
  if (!show) {
    throw new Error('Show not found');
  }

  if (show.status !== 'scheduled') {
    throw new Error(`This show is ${show.status} and cannot be booked`);
  }

  // Check if show has already passed
  if (new Date(show.startTime) < new Date()) {
    throw new Error('This show has already started or ended');
  }

  const now = new Date();
  const holdMinutes = config.booking.holdDurationMinutes;
  const expiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000);

  // Release any existing active holds by THIS user for this show so user can adjust seat choice cleanly
  await SeatHold.updateMany(
    {
      showId: show._id,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active',
    },
    { $set: { status: 'released' } }
  );

  // Check if any requested seats are already permanently sold
  const alreadySold = seatIds.filter((id) => show.soldSeats.includes(id));
  if (alreadySold.length > 0) {
    throw new Error(`Seat(s) ${alreadySold.join(', ')} are already sold`);
  }

  // Check if any requested seats are currently held by another user
  const conflictingHolds = await SeatHold.find({
    showId: show._id,
    seatIds: { $in: seatIds },
    status: 'active',
    expiresAt: { $gt: now },
  });

  if (conflictingHolds.length > 0) {
    const heldSeats = new Set<string>();
    conflictingHolds.forEach((h) => h.seatIds.forEach((s) => heldSeats.add(s)));
    const unavailable = seatIds.filter((id) => heldSeats.has(id));
    throw new Error(
      `Seat(s) ${unavailable.join(', ')} are temporarily held by another customer. Please choose different seats.`
    );
  }

  const holdToken = 'HOLD_' + crypto.randomBytes(16).toString('hex');

  const seatHold = await SeatHold.create({
    showId: show._id,
    userId: new mongoose.Types.ObjectId(userId),
    seatIds,
    holdToken,
    expiresAt,
    status: 'active',
  });

  return {
    holdToken: seatHold.holdToken,
    expiresAt: seatHold.expiresAt,
    seatIds: seatHold.seatIds,
    holdMinutes,
  };
};

export const releaseSeatHold = async (holdToken: string, userId: string): Promise<boolean> => {
  const result = await SeatHold.updateOne(
    {
      holdToken,
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active',
    },
    { $set: { status: 'released' } }
  );
  return result.modifiedCount > 0;
};

export const convertHoldToSold = async (
  showId: string,
  seatIds: string[],
  holdToken?: string
): Promise<boolean> => {
  // Concurrency-safe atomic update:
  // Add seat IDs to soldSeats only if NONE of them are already in soldSeats
  const updateResult = await Show.updateOne(
    {
      _id: showId,
      soldSeats: { $nin: seatIds }, // Concurrency guard: none of the seatIds are already sold
    },
    {
      $push: { soldSeats: { $each: seatIds } },
      $inc: { availableSeatsCount: -seatIds.length },
    }
  );

  if (updateResult.modifiedCount === 0) {
    // If update failed, check if double-booking occurred
    const currentShow = await Show.findById(showId);
    const overlapping = seatIds.filter((s) => currentShow?.soldSeats.includes(s));
    throw new Error(
      `Double-booking prevented! Seat(s) [${overlapping.join(', ')}] were already purchased by another customer.`
    );
  }

  if (holdToken) {
    await SeatHold.updateOne(
      { holdToken },
      { $set: { status: 'converted' } }
    );
  }

  return true;
};

export const releaseSoldSeats = async (showId: string, seatIds: string[]): Promise<void> => {
  await Show.updateOne(
    { _id: showId },
    {
      $pull: { soldSeats: { $in: seatIds } },
      $inc: { availableSeatsCount: seatIds.length },
    }
  );
};
