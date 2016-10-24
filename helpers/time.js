'use strict';

var moment = require('moment');

module.exports = {
    
    millisecondsToYYYYMMDD: function (epoch_time) {
        return this.formatYYYYMMDD(moment(epoch_time * 1000));
    },

    formatYYYYMMDD: function (time) {
        return time.format('YYYYMMDD')
    },

    tomorrowForEpochTime: function (epoch_time) {
        return moment(epoch_time * 1000).add(1, 'days');
    }
    
};