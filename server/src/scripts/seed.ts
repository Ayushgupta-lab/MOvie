import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { City } from '../models/City.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Show } from '../models/Show.js';
import { Coupon } from '../models/Coupon.js';
import { SubscriptionPlan, UserSubscription } from '../models/Subscription.js';
import { Review } from '../models/Review.js';

export const seedDatabase = async (): Promise<void> => {
  console.log('🌱 Starting CineNova Database Seeding...');

  // 1. Check if movies already seeded
  const existingMovies = await Movie.countDocuments();
  if (existingMovies > 0) {
    console.log(`ℹ️ Database already contains ${existingMovies} movies. Skipping full reseed.`);
    return;
  }

  // 2. Demo Users
  const adminUser = await User.create({
    name: 'CineNova Super Admin',
    email: 'admin@cinenova.live',
    password: 'Admin@123456',
    phone: '+91 98765 43210',
    role: 'admin',
    city: 'Mumbai',
    isEmailVerified: true,
    rewardPoints: 500,
  });

  const theatreOwnerUser = await User.create({
    name: 'Vikram Malhotra (PVR Cinemas)',
    email: 'theatre@cinenova.live',
    password: 'Theatre@123456',
    phone: '+91 98200 11223',
    role: 'theatre_owner',
    city: 'Mumbai',
    isEmailVerified: true,
  });

  const customerUser = await User.create({
    name: 'Ayush Sharma',
    email: 'ayush@cinenova.live',
    password: 'Customer@123456',
    phone: '+91 98111 22334',
    role: 'customer',
    city: 'Mumbai',
    isEmailVerified: true,
    isSubscribed: true,
    subscriptionPlan: 'annual',
    subscriptionExpiresAt: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000),
    rewardPoints: 240,
    referralCode: 'AYUSH99',
  });

  await User.create({
    name: 'CineNova Care Agent',
    email: 'support@cinenova.live',
    password: 'Support@123456',
    phone: '+91 98333 44556',
    role: 'support',
    city: 'Mumbai',
    isEmailVerified: true,
  });

  console.log('✅ Created Demo Users (Admin, Theatre Owner, Customer, Support)');

  // 3. Indian Cities
  const cities = await City.insertMany([
    { name: 'Mumbai', state: 'Maharashtra', code: 'MUM', lat: 19.076, lng: 72.8777, isPopular: true },
    { name: 'Delhi-NCR', state: 'Delhi', code: 'DEL', lat: 28.6139, lng: 77.209, isPopular: true },
    { name: 'Bengaluru', state: 'Karnataka', code: 'BLR', lat: 12.9716, lng: 77.5946, isPopular: true },
    { name: 'Hyderabad', state: 'Telangana', code: 'HYD', lat: 17.385, lng: 78.4867, isPopular: true },
    { name: 'Chennai', state: 'Tamil Nadu', code: 'MAA', lat: 13.0827, lng: 80.2707, isPopular: true },
    { name: 'Pune', state: 'Maharashtra', code: 'PNQ', lat: 18.5204, lng: 73.8567, isPopular: true },
    { name: 'Kolkata', state: 'West Bengal', code: 'CCU', lat: 22.5726, lng: 88.3639, isPopular: true },
    { name: 'Ahmedabad', state: 'Gujarat', code: 'AMD', lat: 23.0225, lng: 72.5714, isPopular: false },
    { name: 'Chandigarh', state: 'Punjab', code: 'IXC', lat: 30.7333, lng: 76.7794, isPopular: false },
    { name: 'Jaipur', state: 'Rajasthan', code: 'JAI', lat: 26.9124, lng: 75.7873, isPopular: false },
    { name: 'Kochi', state: 'Kerala', code: 'COK', lat: 9.9312, lng: 76.2673, isPopular: false },
  ]);
  console.log(`✅ Created ${cities.length} Cities`);

  // 4. Movies with rich metadata
  const movies = await Movie.insertMany([
    {
      title: 'Dune: Part Two',
      slug: 'dune-part-two',
      synopsis:
        'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
      posterUrl:
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
      durationMinutes: 166,
      certification: 'UA',
      languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
      genres: ['Sci-Fi', 'Adventure', 'Action'],
      formats: ['IMAX 2D', '4DX', 'Dolby Atmos', '2D'],
      releaseDate: new Date('2024-03-01'),
      isTrending: true,
      isNowShowing: true,
      isComingSoon: false,
      avgRating: 9.4,
      ratingCount: 1420,
      cast: [
        { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
        { name: 'Zendaya', role: 'Chani', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
        { name: 'Rebecca Ferguson', role: 'Lady Jessica', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
        { name: 'Javier Bardem', role: 'Stilgar', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
      ],
      crew: [
        { name: 'Denis Villeneuve', role: 'Director' },
        { name: 'Hans Zimmer', role: 'Music Composer' },
      ],
    },
    {
      title: 'Kalki 2898 AD',
      slug: 'kalki-2898-ad',
      synopsis:
        'Set in a post-apocalyptic world in the year 2898 AD, a modern-day avatar of Vishnu descends on Earth to protect mankind from dark malevolent forces.',
      posterUrl:
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
      durationMinutes: 181,
      certification: 'UA',
      languages: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada'],
      genres: ['Sci-Fi', 'Action', 'Mythology'],
      formats: ['3D', 'IMAX 3D', 'Dolby Atmos', '2D'],
      releaseDate: new Date('2024-06-27'),
      isTrending: true,
      isNowShowing: true,
      isComingSoon: false,
      avgRating: 9.1,
      ratingCount: 2180,
      cast: [
        { name: 'Prabhas', role: 'Bhairava', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
        { name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
        { name: 'Deepika Padukone', role: 'SUM-80', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
        { name: 'Kamal Haasan', role: 'Supreme Yaskin', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
      ],
      crew: [
        { name: 'Nag Ashwin', role: 'Director' },
        { name: 'Santhosh Narayanan', role: 'Music Composer' },
      ],
    },
    {
      title: 'Oppenheimer',
      slug: 'oppenheimer',
      synopsis:
        'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
      posterUrl:
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
      durationMinutes: 180,
      certification: 'A',
      languages: ['English', 'Hindi'],
      genres: ['Biography', 'Drama', 'History'],
      formats: ['IMAX 2D', 'Dolby Atmos', '2D'],
      releaseDate: new Date('2023-07-21'),
      isTrending: true,
      isNowShowing: true,
      isComingSoon: false,
      avgRating: 9.3,
      ratingCount: 3120,
      cast: [
        { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
        { name: 'Emily Blunt', role: 'Kitty Oppenheimer', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
        { name: 'Robert Downey Jr.', role: 'Lewis Strauss', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
      ],
      crew: [
        { name: 'Christopher Nolan', role: 'Director' },
        { name: 'Ludwig Göransson', role: 'Music Composer' },
      ],
    },
    {
      title: 'Deadpool & Wolverine',
      slug: 'deadpool-and-wolverine',
      synopsis:
        'Wolverine is recovering from his injuries when he crosses paths with the loudmouth Deadpool. They team up to defeat a common enemy.',
      posterUrl:
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
      durationMinutes: 128,
      certification: 'A',
      languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
      genres: ['Action', 'Comedy', 'Sci-Fi'],
      formats: ['3D', 'IMAX 3D', '4DX', '2D'],
      releaseDate: new Date('2024-07-26'),
      isTrending: true,
      isNowShowing: true,
      isComingSoon: false,
      avgRating: 9.0,
      ratingCount: 2450,
      cast: [
        { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80' },
        { name: 'Hugh Jackman', role: 'Logan / Wolverine', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80' },
      ],
      crew: [{ name: 'Shawn Levy', role: 'Director' }],
    },
    {
      title: 'Stree 2',
      slug: 'stree-2',
      synopsis:
        'After the events of Stree, the town of Chanderi is being haunted again. This time by a headless entity named Sarkata who is abducting forward-thinking women.',
      posterUrl:
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=KVnhefZ5GXE',
      durationMinutes: 147,
      certification: 'UA',
      languages: ['Hindi'],
      genres: ['Comedy', 'Horror'],
      formats: ['2D', 'Dolby Atmos'],
      releaseDate: new Date('2024-08-15'),
      isTrending: false,
      isNowShowing: true,
      isComingSoon: false,
      avgRating: 8.7,
      ratingCount: 1890,
      cast: [
        { name: 'Rajkummar Rao', role: 'Vicky', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80' },
        { name: 'Shraddha Kapoor', role: 'The Mystery Woman', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
        { name: 'Pankaj Tripathi', role: 'Rudra', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80' },
      ],
      crew: [{ name: 'Amar Kaushik', role: 'Director' }],
    },
    {
      title: 'Avatar: Fire and Ash',
      slug: 'avatar-fire-and-ash',
      synopsis:
        'Jake Sully and Neytiri encounter a new, aggressive volcanic clan of Na\'vi called the Ash People as warfare escalates across Pandora.',
      posterUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
      durationMinutes: 190,
      certification: 'UA',
      languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
      genres: ['Sci-Fi', 'Action', 'Adventure'],
      formats: ['IMAX 3D', '4DX', 'RealD 3D', '2D'],
      releaseDate: new Date('2025-12-19'),
      isTrending: false,
      isNowShowing: false,
      isComingSoon: true,
      avgRating: 0,
      ratingCount: 0,
      cast: [
        { name: 'Sam Worthington', role: 'Jake Sully', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
        { name: 'Zoe Saldana', role: 'Neytiri', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
      ],
      crew: [{ name: 'James Cameron', role: 'Director' }],
    },
  ]);
  console.log(`✅ Created ${movies.length} Movies`);

  // 5. Theatres across Indian Metros
  const theatres = await Theatre.insertMany([
    {
      name: 'PVR INOX: Phoenix Palladium',
      chainName: 'PVR INOX',
      city: 'Mumbai',
      locality: 'Lower Parel',
      address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
      lat: 18.9953,
      lng: 72.8242,
      amenities: ['IMAX Laser', 'Recliner Seats', 'Dolby Atmos', 'Gourmet Food', 'Wheelchair Accessible', 'Free Parking', 'Ticket Cancellation'],
      ownerId: theatreOwnerUser._id,
      isApproved: true,
      verificationStatus: 'approved',
      contactPhone: '022-43345566',
      contactEmail: 'palladium.mumbai@pvrcinemas.com',
      cancellationWindowHours: 2,
      refundPercentage: 75,
    },
    {
      name: 'Cinépolis: Viviana Mall',
      chainName: 'Cinépolis',
      city: 'Mumbai',
      locality: 'Thane West',
      address: 'Eastern Express Hwy, Near Jupiter Hospital, Thane West, Maharashtra 400606',
      lat: 19.2088,
      lng: 72.9715,
      amenities: ['4DX Motion', 'VIP Lounges', 'Dolby Atmos', 'Wheelchair Accessible', 'Ticket Cancellation'],
      ownerId: theatreOwnerUser._id,
      isApproved: true,
      verificationStatus: 'approved',
      contactPhone: '022-61701234',
      contactEmail: 'viviana.thane@cinepolis.com',
      cancellationWindowHours: 2,
      refundPercentage: 75,
    },
    {
      name: 'PVR Director’s Cut: Ambience Mall',
      chainName: 'PVR INOX',
      city: 'Delhi-NCR',
      locality: 'Vasant Kunj',
      address: 'Nelson Mandela Marg, Vasant Kunj II, New Delhi, Delhi 110070',
      lat: 28.5284,
      lng: 77.1554,
      amenities: ['Ultra Luxury', 'Chef Prepared Meals', 'Recliner Seats', 'Dolby Atmos', 'Valet Parking'],
      ownerId: theatreOwnerUser._id,
      isApproved: true,
      verificationStatus: 'approved',
      contactPhone: '011-40870000',
      contactEmail: 'directorscut@pvrcinemas.com',
      cancellationWindowHours: 3,
      refundPercentage: 75,
    },
    {
      name: 'PVR IMAX: Forum South Bengaluru',
      chainName: 'PVR INOX',
      city: 'Bengaluru',
      locality: 'Kanakapura Road',
      address: 'Konanakunte Cross, Metro Station, Bengaluru, Karnataka 560062',
      lat: 12.8893,
      lng: 77.5562,
      amenities: ['IMAX with Laser', 'Dolby Atmos', 'Food Court', 'Wheelchair Accessible', 'Ticket Cancellation'],
      ownerId: theatreOwnerUser._id,
      isApproved: true,
      verificationStatus: 'approved',
      contactPhone: '080-69223344',
      contactEmail: 'forum.blr@pvrcinemas.com',
      cancellationWindowHours: 2,
      refundPercentage: 75,
    },
    {
      name: 'Prasads Multiplex & IMAX',
      chainName: 'Prasads',
      city: 'Hyderabad',
      locality: 'Necklace Road',
      address: 'NTR Gardens, Khairatabad, Hyderabad, Telangana 500063',
      lat: 17.4125,
      lng: 78.4682,
      amenities: ['Giant Screen', 'Dolby Atmos', 'Food & Games Arena', 'Free Parking', 'Ticket Cancellation'],
      ownerId: theatreOwnerUser._id,
      isApproved: true,
      verificationStatus: 'approved',
      contactPhone: '040-23448888',
      contactEmail: 'info@prasadz.com',
      cancellationWindowHours: 2,
      refundPercentage: 80,
    },
  ]);
  console.log(`✅ Created ${theatres.length} Theatres`);

  // Helper to generate seat grid: 8 rows (A-H), 12 cols (1-12)
  const generateSeats = (rows = 8, cols = 12) => {
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seats: any[] = [];
    const categories = [
      { name: 'Recliner', basePrice: 480, rows: ['A'] },
      { name: 'Prime', basePrice: 290, rows: ['B', 'C', 'D'] },
      { name: 'Classic', basePrice: 190, rows: ['E', 'F', 'G', 'H'] },
    ];

    for (const r of rowLetters) {
      const cat = categories.find((c) => c.rows.includes(r))?.name || 'Classic';
      const price = categories.find((c) => c.name === cat)?.basePrice || 190;

      for (let c = 1; c <= cols; c++) {
        seats.push({
          id: `${r}${c}`,
          row: r,
          number: c,
          category: cat,
          type: r === 'H' && (c === 1 || c === cols) ? 'wheelchair' : 'regular',
          price,
        });
      }
    }

    return { rows, cols, categories, seats };
  };

  // 6. Screens for theatres
  const screens: any[] = [];
  for (const theatre of theatres) {
    const s1 = await Screen.create({
      theatreId: theatre._id,
      name: 'Audi 1 - IMAX with Laser',
      screenType: 'IMAX',
      totalSeats: 96,
      seatLayout: generateSeats(8, 12),
    });

    const s2 = await Screen.create({
      theatreId: theatre._id,
      name: 'Audi 2 - Dolby Atmos 4DX',
      screenType: '4DX',
      totalSeats: 96,
      seatLayout: generateSeats(8, 12),
    });

    const s3 = await Screen.create({
      theatreId: theatre._id,
      name: 'Audi 3 - RealD 3D Screen',
      screenType: 'RealD 3D',
      totalSeats: 96,
      seatLayout: generateSeats(8, 12),
    });

    screens.push(s1, s2, s3);
  }
  console.log(`✅ Created ${screens.length} Auditoriums/Screens`);

  // 7. Shows for Today, Tomorrow, and Next 3 Days
  const now = new Date();
  const showTimes = ['10:30', '13:45', '17:15', '20:30', '23:00'];
  const createdShows: any[] = [];

  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    // For each theatre, create shows for now showing movies
    for (const theatre of theatres) {
      const theatreScreens = screens.filter((s) => s.theatreId.toString() === theatre._id.toString());

      for (let i = 0; i < Math.min(movies.length - 1, 4); i++) {
        const movie = movies[i];
        const screen = theatreScreens[i % theatreScreens.length];
        const timeSlot = showTimes[(i + dayOffset) % showTimes.length];

        const [hours, mins] = timeSlot.split(':').map(Number);
        const startTime = new Date(targetDate);
        startTime.setHours(hours, mins, 0, 0);

        const endTime = new Date(startTime.getTime() + movie.durationMinutes * 60000);

        // Pre-simulate some sold seats for realistic appearance
        const demoSoldSeats = dayOffset === 0 ? ['C5', 'C6', 'C7', 'D5', 'D6', 'B8'] : [];

        const show = await Show.create({
          movieId: movie._id,
          theatreId: theatre._id,
          screenId: screen._id,
          startTime,
          endTime,
          dateStr,
          language: movie.languages[0],
          format: screen.screenType === 'IMAX' ? 'IMAX 2D' : screen.screenType === '4DX' ? '4DX' : '2D',
          pricing: [
            { category: 'Recliner', price: screen.screenType === 'IMAX' ? 550 : 450 },
            { category: 'Prime', price: screen.screenType === 'IMAX' ? 360 : 280 },
            { category: 'Classic', price: screen.screenType === 'IMAX' ? 240 : 190 },
          ],
          status: 'scheduled',
          soldSeats: demoSoldSeats,
          totalSeats: screen.totalSeats,
          availableSeatsCount: screen.totalSeats - demoSoldSeats.length,
        });

        createdShows.push(show);
      }
    }
  }
  console.log(`✅ Created ${createdShows.length} Scheduled Shows`);

  // 8. Coupons
  await Coupon.insertMany([
    {
      code: 'FIRST50',
      title: 'First Booking Offer',
      description: 'Get flat ₹50 OFF on your first movie ticket booking with CineNova!',
      discountType: 'flat',
      discountValue: 50,
      minSpend: 200,
      maxDiscount: 50,
      isNewUserOnly: true,
      isMemberOnly: false,
      usageLimit: 5000,
      usedCount: 14,
      perUserLimit: 1,
      expiresAt: new Date('2027-12-31'),
      isActive: true,
    },
    {
      code: 'CINEMAGIC',
      title: '20% Weekend Blockbuster',
      description: 'Enjoy 20% discount up to ₹150 on tickets for top movies.',
      discountType: 'percentage',
      discountValue: 20,
      minSpend: 400,
      maxDiscount: 150,
      isNewUserOnly: false,
      isMemberOnly: false,
      usageLimit: 10000,
      usedCount: 82,
      perUserLimit: 3,
      expiresAt: new Date('2027-12-31'),
      isActive: true,
    },
    {
      code: 'WEEKEND100',
      title: 'Flat ₹100 Off Multi-Seat',
      description: 'Book 2 or more tickets and enjoy flat ₹100 instant cashback discount.',
      discountType: 'flat',
      discountValue: 100,
      minSpend: 500,
      maxDiscount: 100,
      isNewUserOnly: false,
      isMemberOnly: false,
      usageLimit: 3000,
      usedCount: 45,
      perUserLimit: 2,
      expiresAt: new Date('2027-12-31'),
      isActive: true,
    },
    {
      code: 'PLUSMEMBER',
      title: 'CineNova Plus VIP Bonus',
      description: 'Exclusive 15% discount for verified CineNova Plus subscribers.',
      discountType: 'percentage',
      discountValue: 15,
      minSpend: 250,
      maxDiscount: 200,
      isNewUserOnly: false,
      isMemberOnly: true,
      usageLimit: 10000,
      usedCount: 29,
      perUserLimit: 10,
      expiresAt: new Date('2027-12-31'),
      isActive: true,
    },
  ]);
  console.log('✅ Created Promotional Coupons');

  // 9. CineNova Plus Membership Plans
  await SubscriptionPlan.insertMany([
    {
      planId: 'monthly',
      name: 'CineNova Plus Monthly',
      price: 199,
      durationDays: 30,
      benefits: [
        '100% Waived Convenience Fee on all bookings',
        '10% instant discount on every ticket (up to ₹150/booking)',
        'Free 1 regular popcorn on 1st booking of the month',
        '24-Hour early access to blockbuster IMAX pre-bookings',
        'Priority customer care with dedicated helpline',
      ],
      convenienceFeeWaiver: true,
      ticketDiscountPercent: 10,
      maxDiscountPerBooking: 150,
      isActive: true,
    },
    {
      planId: 'annual',
      name: 'CineNova Plus Annual (Best Value)',
      price: 1499,
      durationDays: 365,
      benefits: [
        'Save 37% compared to monthly renewal',
        'Zero convenience fee on unlimited movie tickets for a year',
        '15% instant discount on every ticket (up to ₹200/booking)',
        'Complimentary Birthday Movie Ticket voucher',
        '2 Free Gourmet Food & Beverage Combo vouchers',
        'VIP Express Counter lane at partner PVR and Cinepolis theatres',
      ],
      convenienceFeeWaiver: true,
      ticketDiscountPercent: 15,
      maxDiscountPerBooking: 200,
      isActive: true,
    },
  ]);
  console.log('✅ Created CineNova Plus Subscription Plans');

  // 10. Sample Verified Reviews
  await Review.insertMany([
    {
      movieId: movies[0]._id,
      userId: customerUser._id,
      userName: 'Ayush Sharma',
      rating: 10,
      comment:
        'Denis Villeneuve has created a cinematic masterpiece! The IMAX sound design and visual majesty in the desert sequences are unmatched.',
      isVerifiedBooking: true,
      helpfulCount: 34,
      isApproved: true,
    },
    {
      movieId: movies[1]._id,
      userId: customerUser._id,
      userName: 'Ayush Sharma',
      rating: 9,
      comment:
        'Spectacular fusion of Indian mythology and dystopian sci-fi. Amitabh Bachchan as Ashwatthama stole the entire second half!',
      isVerifiedBooking: true,
      helpfulCount: 28,
      isApproved: true,
    },
  ]);
  console.log('✅ Created Verified Reviews');

  console.log('🎉 CineNova Seeding Completed Successfully!');
};

// If run directly via tsx src/scripts/seed.ts
if (process.argv[1]?.includes('seed.ts')) {
  import('../config/db.js').then(async ({ connectDatabase, disconnectDatabase }) => {
    try {
      await connectDatabase();
      await seedDatabase();
      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      console.error('Seeding error:', err);
      process.exit(1);
    }
  });
}
