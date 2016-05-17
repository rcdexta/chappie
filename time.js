'use strict';

var moment = require('moment');

module.exports = {
    millisecondsToYYYYMMDD: function(epoch_time){
        return moment(epoch_time*1000).format('YYYYMMDD');
    }
};