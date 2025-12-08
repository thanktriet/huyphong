// =======================================================
// CALENDAR SERVICE
// =======================================================

const CalendarService = {
    // Get schedule
    async getSchedule(useCache = true) {
        try {
            return await API.getSchedule(useCache);
        } catch (error) {
            return Utils.handleError(error, 'CalendarService.getSchedule');
        }
    },

    // Book session
    async bookSession(data) {
        try {
            const result = await API.call('bookSession', data);
            if (result.success) {
                Utils.cache.clear('schedule');
            }
            return result;
        } catch (error) {
            return Utils.handleError(error, 'CalendarService.bookSession');
        }
    },

    // Cancel session
    async cancelSession(bookingId) {
        try {
            const result = await API.call('cancelSession', { bookingId });
            if (result.success) {
                Utils.cache.clear('schedule');
            }
            return result;
        } catch (error) {
            return Utils.handleError(error, 'CalendarService.cancelSession');
        }
    },

    // Update schedule
    async updateSchedule(data) {
        try {
            const result = await API.call('updateSchedule', data);
            if (result.success) {
                Utils.cache.clear('schedule');
            }
            return result;
        } catch (error) {
            return Utils.handleError(error, 'CalendarService.updateSchedule');
        }
    }
};

window.CalendarService = CalendarService;

