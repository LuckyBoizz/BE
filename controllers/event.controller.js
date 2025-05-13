/** @format */
const Event = require("../models/event.model.js");
const moment = require("moment-timezone");

const getAllEvents = async (req, res) => {
  try {
    const event = await Event.find({});
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    // Convert dates to moment objects in Vietnam timezone
    const startMoment = moment(startDate);
    const endMoment = moment(endDate);

    // Validate dates
    if (!startMoment.isValid() || !endMoment.isValid()) {
      return res.status(400).json({
        success: false,
        message: "Invalid value",
      });
    }

    // Check if end date is after start date
    if (endMoment <= startMoment) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create event if validation passes
    const event = await Event.create(req.body);

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndUpdate(id, req.body);

    if (!event) {
      return res.status(400).json({ message: "Invalid event data" });
    }

    const updatedEvent = await Event.findById(id);

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTodayEvents = async (req, res) => {
  try {
    // Get today's date at start and end
    const today = moment().startOf("day").toDate();
    const tomorrow = moment().endOf("day").toDate();

    // Find events that are active today
    const events = await Event.find({
      $and: [{ startDate: { $lte: tomorrow } }, { endDate: { $gte: today } }],
    });
    // console.log(events);
    return events;
  } catch (error) {
    throw error;
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    // Get today's date at start and end
    const today = moment().endOf("day").toDate();

    // Find events that are active today
    const events = await Event.find({
      startDate: { $gte: today },
    });
    return res.status(200).json({
      success: true,
      message: `Found ${events.length} upcoming events`,
      data: events,
    });
  } catch (error) {
    console.error("Error finding upcoming events:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOngoingEvents = async (req, res) => {
  try {
    // Get today's date at start and end
    const today = moment().toDate();

    // Find events that are active today
    const events = await Event.find({
      $and: [{ startDate: { $lte: today } }, { endDate: { $gte: today } }],
    });
    return res.status(200).json({
      success: true,
      message: `Found ${events.length} ongoing events`,
      data: events,
    });
  } catch (error) {
    console.error("Error finding ongoing events:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEventByDate = async (req, res) => {
  try {
    const date = req.params?.date || req; // Assuming date is passed as a parameter
    console.log(date);
    // Validate date format
    if (!moment(date, moment.ISO_8601, true).isValid()) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Please use ISO format (e.g. 2024-03-27T00:00:00.000Z)",
      });
    }

    // Convert to Vietnam timezone and get start/end of day
    const startDate = moment(date).startOf("day").toDate();
    const endDate = moment(date).endOf("day").toDate();

    // Find events that overlap with the given date
    const events = await Event.find({
      $and: [
        { startDate: { $lte: startDate } },
        { endDate: { $gte: endDate } },
      ],
    });

    if (req.params?.date) {
      if (!events.length) {
        return res.status(200).json({
          success: true,
          message: `No events found for date ${date}`,
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        message: `Found ${events.length} events for date ${date}`,
        data: events,
      });
    } else {
      return events;
    }
    

  } catch (error) {
    console.error("Error finding events by date:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// const getEventDiscountRate = async (events) => {
//   if (!events || events.length === 0) {
//     return events; // No events found, return 0 or handle as needed
//   }
//   const event = events[0]; // The first event
//   const discountRates = {
//     SuperVip: event.discountRateSupervip || 0,
//     Vip: event.discountRateVip || 0,
//     Normal: event.discountRateNormal || 0,
//   };
//   // console.log(discountRates);
//   return discountRates;
// };

// Update the exports
module.exports = {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getTodayEvents,
  getEventByDate,
  // getEventDiscountRate,
  getUpcomingEvents,
  getOngoingEvents,
};
