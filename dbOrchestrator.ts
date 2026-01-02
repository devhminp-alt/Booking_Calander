
import { Booking, Room, BookingStatus, BookedService, ServiceDefinition } from './types';

/**
 * SQLite Orchestration Layer
 * Translates UI actions into SQLite statements for Reservation, MasterItem, InvItemDB, and InvRoom tables.
 */

export interface SQLCommand {
  statement: string;
  params: any[];
  timestamp: string;
}

export class DBOrchestrator {
  private static sqlLog: SQLCommand[] = [];

  static getLog(): SQLCommand[] {
    return this.sqlLog;
  }

  private static log(statement: string, params: any[]) {
    this.sqlLog.unshift({
      statement,
      params,
      timestamp: new Date().toISOString()
    });
    console.log(`[SQL EXEC] ${statement}`, params);
  }

  // Master Data Synchronization
  static syncServicesMaster(services: ServiceDefinition[]) {
    this.log(`DELETE FROM MasterItem`, []);
    services.forEach(s => {
      this.log(
        `INSERT INTO MasterItem (id, name, defaultPrice, type) VALUES (?, ?, ?, ?)`,
        [s.id, s.name, s.defaultPrice, s.type]
      );
    });
  }

  // Added missing syncRoom method to persist room master data
  static syncRoom(room: Room, isNew: boolean) {
    if (isNew) {
      this.log(
        `INSERT INTO Rooms (id, name, type, capacity, baseCapacity, extraPersonPrice, price, color, hasBathroom, description, building, roomNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [room.id, room.name, room.type, room.capacity, room.baseCapacity, room.extraPersonPrice, room.price, room.color, room.hasBathroom ? 1 : 0, room.description, room.building, room.roomNumber]
      );
    } else {
      this.log(
        `UPDATE Rooms SET name=?, type=?, capacity=?, baseCapacity=?, extraPersonPrice=?, price=?, color=?, hasBathroom=?, description=?, building=?, roomNumber=? WHERE id=?`,
        [room.name, room.type, room.capacity, room.baseCapacity, room.extraPersonPrice, room.price, room.color, room.hasBathroom ? 1 : 0, room.description, room.building, room.roomNumber, room.id]
      );
    }
  }

  // Added missing deleteRoom method to persist room deletion
  static deleteRoom(id: string) {
    this.log(`DELETE FROM Rooms WHERE id=?`, [id]);
  }

  static syncBooking(booking: Booking, isNew: boolean, roomData: Room) {
    const invRoomId = `IR-${booking.id}`;

    if (isNew) {
      // 1. INSERT InvRoom (Relational Requirement)
      this.log(
        `INSERT INTO InvRoom (InvRoomId, roomId, name, basePrice, capacity) VALUES (?, ?, ?, ?, ?)`,
        [invRoomId, roomData.id, roomData.name, roomData.price, roomData.capacity]
      );

      // 2. INSERT Reservation
      this.log(
        `INSERT INTO Reservation (ReservId, roomId, guestName, guestCount, startDate, endDate, status, amount, InvoiceId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [booking.id, booking.roomId, booking.guestName, booking.guestCount, booking.startDate, booking.endDate, booking.status, booking.amount, booking.invoiceId]
      );

      // 3. INSERT Invoice Skeleton
      this.log(
        `INSERT INTO Invoice (InvoiceId, ReservId, InvRoomId, totalAmount, status) VALUES (?, ?, ?, ?, ?)`,
        [booking.invoiceId, booking.id, invRoomId, booking.amount, 'DRAFT']
      );

      // 4. INSERT Initial Items into InvItemDB
      booking.bookedServices.forEach(service => {
        this.syncService(service, booking.invoiceId!);
      });
    } else {
      // UPDATE logic
      this.log(
        `UPDATE InvRoom SET roomId=?, name=?, basePrice=? WHERE InvRoomId=?`,
        [roomData.id, roomData.name, roomData.price, invRoomId]
      );

      this.log(
        `UPDATE Reservation SET roomId=?, guestName=?, guestCount=?, startDate=?, endDate=?, status=?, amount=? WHERE ReservId=?`,
        [booking.roomId, booking.guestName, booking.guestCount, booking.startDate, booking.endDate, booking.status, booking.amount, booking.id]
      );

      this.log(
        `UPDATE Invoice SET totalAmount=? WHERE InvoiceId=?`,
        [booking.amount, booking.invoiceId]
      );

      // Refresh items
      this.log(`DELETE FROM InvItemDB WHERE InvoiceId=?`, [booking.invoiceId]);
      booking.bookedServices.forEach(service => {
        this.syncService(service, booking.invoiceId!);
      });
    }
  }

  static syncService(service: BookedService, invoiceId: string) {
    // Maps to InvItemDB - Restored 'days' field in sync logic
    this.log(
      `INSERT INTO InvItemDB (id, InvoiceId, MasterItemId, name, price, quantity, startDate, endDate, days) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [service.id, invoiceId, service.serviceId, service.name, service.price, service.quantity, service.startDate, service.endDate, service.days]
    );
  }

  static deleteBooking(id: string, invoiceId?: string) {
    this.log(`DELETE FROM Reservation WHERE ReservId=?`, [id]);
    this.log(`DELETE FROM InvRoom WHERE InvRoomId=?`, [`IR-${id}`]);
    if (invoiceId) {
      this.log(`DELETE FROM InvItemDB WHERE InvoiceId=?`, [invoiceId]);
      this.log(`DELETE FROM Invoice WHERE InvoiceId=?`, [invoiceId]);
    }
  }
}
