import { Request, Response } from 'express';
import crypto from 'crypto';
import { SupportTicket } from '../models/SupportTicket.js';
import { AuthRequest } from '../middleware/auth.js';

export const createTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, bookingReference, category, subject, message } = req.body;

    if (!subject || !message) {
      res.status(400).json({ success: false, message: 'Subject and message are required' });
      return;
    }

    const userName = req.user?.name || name || 'Anonymous Guest';
    const userEmail = req.user?.email || email;

    if (!userEmail) {
      res.status(400).json({ success: false, message: 'Email address is required' });
      return;
    }

    const ticketNumber = 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();

    const ticket = await SupportTicket.create({
      ticketNumber,
      userId: req.user?.id,
      userName,
      userEmail,
      bookingReference: bookingReference?.trim().toUpperCase(),
      category: category || 'booking',
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our help desk will reply shortly.',
      ticket,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyTickets = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const tickets = await SupportTicket.find({
      $or: [{ userId: req.user.id }, { userEmail: req.user.email }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: tickets.length, tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicketDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketNumber } = req.params;
    const ticket = await SupportTicket.findOne({
      ticketNumber: ticketNumber.toUpperCase().trim(),
    });

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    res.json({ success: true, ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { ticketNumber } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
      return;
    }

    const ticket = await SupportTicket.findOne({ ticketNumber: ticketNumber.toUpperCase().trim() });
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket not found' });
      return;
    }

    const senderRole = req.user?.role || 'customer';
    const senderName = req.user?.name || ticket.userName;

    ticket.responses.push({
      senderRole,
      senderName,
      message: message.trim(),
      createdAt: new Date(),
    });

    if (senderRole === 'admin' || senderRole === 'support') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    res.json({ success: true, message: 'Reply added successfully', ticket });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
