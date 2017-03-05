'use strict';
var sprintf = require("sprintf-js").sprintf;

Array.prototype.shuffle = function () {
    return this[Math.floor(Math.random() * this.length)];
};

module.exports = {

    wfh: ["Long commutes make you fat, stressed, and miserable! You chose wisely! %s!",
        "Commuting doesn’t do a body good. It isn’t good for the environment either. Smart thinking %s!",
        "Work from home and be your own boss. Have a power cut free day %s!",
        "After all, I realised you cannot teleport like me! :stuck_out_tongue: Good day %s..",
        "Hope there is no scheduled power shutdown at your place! :wink: Just kidding... Take care",
        "Good for you %s. Here have a comic digression: http://dilbert.com/strip/2010-05-02",
        "Hope you have a calm and commute free day %s. I am serious! http://dilbert.com/strip/2014-07-10"],

    office: ["Great %s! High speed wifi and low carb sundal awaits you!",
        "See you %s! I guess you love our office space! http://dilbert.com/strip/2015-10-24",
        "Great! I am planning to order a new office chair for you: https://xkcd.com/1329/"],

    sayWfh: function (name) {
        return sprintf(this.wfh.shuffle(), name);
    },

    sayOffice: function (name) {
        return sprintf(this.office.shuffle(), name);
    }

};