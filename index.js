'use strict';

const GPIO = require('pigpio').Gpio;

const DIR_CW = 0;
const DIR_CCW = 1;
const CHANNEL_A = 0;
const CHANNEL_B = 1;

class Channel {

    constructor (pwm, in1, in2, channel) {
        this._pwm = new GPIO(pwm, { mode : GPIO.OUTPUT });
        this._in1 = new GPIO(in1, { mode : GPIO.OUTPUT });
        this._in2 = new GPIO(in2, { mode : GPIO.OUTPUT });
        this._channel = channel;
    }

    stop() {
        [this._in1, this._in2].forEach((e) => e.digitalWrite(0));
        this._pwm.digitalWrite(1);
    }

    turn(direction, speed, ms) {
        this._pwm.pwmWrite(speed);
        this._in1.digitalWrite(direction == DIR_CW ? 1 : 0);
        this._in2.digitalWrite(direction == DIR_CW ? 0 : 1);
        if (ms > 0) setTimeout(() => this.stop(), ms);
    }

    turn_cw(speed = 127, ms = 0) {
        this.turn(DIR_CW, speed, ms);
    }

    turn_ccw(speed = 127, ms = 0) {
        this.turn(DIR_CCW, speed, ms);
    }

    brake() {
        this._pwm.digitalWrite(0);
        this._in1.digitalWrite(0);
        this._in2.digitalWrite(this._channel == CHANNEL_A ? 1 : 0);
    }

}

class TB6612 {

    constructor (stby = null, pwma, ain1, ain2, pwmb, bin1, bin2) {

        let channel_a = null;
        if (pwma && ain1 && ain2) {
            channel_a = new Channel(pwma, ain1, ain2, CHANNEL_A);
        }

        let channel_b = null;
        if (pwmb && bin1 && bin2) {
            channel_b = new Channel(pwmb, bin1, bin2, CHANNEL_B);
        }

        Object.defineProperty(this, 'channel_a', { get : () => channel_a });
        Object.defineProperty(this, 'channel_b', { get : () => channel_b });

        if (typeof stby == 'number') {
            this._stby = new GPIO(stby, { mode : GPIO.OUTPUT });
        } else {
            this._stby = null;
        }

    }

    wake() {
        this._stby.digitalWrite(1);
    }

    stand_by() {
        this._stby.digitalWrite(0);
    }

}

module.exports = TB6612;
