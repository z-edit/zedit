(() => {

    const isNumberAndInRange = (input, min, max) => {
        return typeof input === 'number' && input >= min && input <= max;
    };

    const formatNumber = (number, format) => {
        if (format === 10) {
            return number;
        } else if (format === 16) {
            let output = number.toString(16);
            if (output.length === 1) output = `0${output}`;
            return output;
        } else if (format === 'percent') {
            return Math.round(number / 255 * 1000) / 1000;
        } else {
            throw new Error('Format is invalid.');
        }
    };

    const checkComponent = (label, value, max = 255) => {
        if (value === undefined) throw new Error(`Component "${label}" is undefined.`);
        if (value < 0) throw new Error(`Component "${label}" is negative.`);
        if (value > max) throw new Error(`Component "${label}" exceeds maximum value of ${max}.`);
    };

    const parseRGBA = (color) => {
        let matches, r, g, b, a = 1;

        if (matches = color.match(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)) {
            r = parseInt(matches[1]);
            g = parseInt(matches[2]);
            b = parseInt(matches[3]);
        } else if (matches = color.match(/rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i)) {
            r = parseInt(matches[1]);
            g = parseInt(matches[2]);
            b = parseInt(matches[3]);
            a = parseFloat(matches[4]);
        } else {
            return;
        }

        checkComponent('red', r);
        checkComponent('green', g);
        checkComponent('blue', b);
        checkComponent('alpha', a, 1);

        return { red: r, green: g, blue: b, alpha: a * 255 }
    };

    const parseHex = (color) => {
        if (!color.match(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i)) return;
        color = color.replace(/^#/, '');

        return {
            red   : parseInt(color.substr(0, 2), 16),
            green : parseInt(color.substr(2, 2), 16),
            blue  : parseInt(color.substr(4, 2), 16),
            alpha :  parseInt(color.substr(6, 2) || 'FF', 16)
        }
    };

    class Color {

        constructor (color) {
            this.channel = undefined;

            if (typeof color === 'string') {
                this.channel = parseHex(color) || parseRGBA(color);
                if (!this.channel) throw new Error('Failed to parse color.');
            } else if (typeof color === 'object') {
                if (color.constructor === Array) {
                    if (color.length > 4) throw new Error('Array length must not exceed 4.');
                    this.channel = {
                        red: color[0] || 0,
                        green: color[1] || 0,
                        blue: color[2] || 0,
                        alpha: color[3] || 255
                    }
                } else if (color instanceof Color) {
                    this.channel = {
                        red: color.channel.red,
                        green: color.channel.green,
                        blue: color.channel.blue,
                        alpha: color.channel.alpha
                    };
                } else {
                    throw new Error('Object must be an array of color values or a color object.');
                }
            } else {
                throw new Error('Color constructor requires a string, array, or color object.');
            }
        }

        setRed (value) {
            if (!isNumberAndInRange(value, 0, 255)) {
                throw new Error('Argument must be a number between 0 ~ 255.');
            }

            this.channel.red = Math.floor(value);
        }

        setGreen (value) {
            if (!isNumberAndInRange(value, 0, 255)) {
                throw new Error('Argument must be a number between 0 ~ 255.');
            }

            this.channel.green = Math.floor(value);
        }

        setBlue (value) {
            if (!isNumberAndInRange(value, 0, 255)) {
                throw new Error('Argument must be a number between 0 ~ 255.');
            }

            this.channel.blue = Math.floor(value);
        }

        setAlpha (value) {
            if (!isNumberAndInRange(value, 0, 1)) {
                throw new Error('Argument must be a number between 0 ~ 1.');
            }

            this.channel.alpha = Math.floor(value * 255);
        }

        getRed (format=10) {
            return formatNumber(this.channel.red, format);
        }

        getGreen (format=10) {
            return formatNumber(this.channel.green, format);
        }

        getBlue (format=10) {
            return formatNumber(this.channel.blue, format);
        }

        getAlpha (format='percent') {
            return formatNumber(this.channel.alpha, format);
        }

        getComponents (format = 10, alphaFormat) {
            let components = [this.getRed(format), this.getGreen(format), this.getBlue(format)];
            if (alphaFormat) {
                components[format == 16 ? 'unshift' : 'push'](this.getAlpha(alphaFormat));
            }
            return components;
        }

        toRGB () {
            return `rgb(${this.getComponents(10).join(', ')})`;
        }

        toRGBA () {
            return `rgba(${this.getComponents(10, 'percent').join(', ')})`;
        }

        toHex () {
            return `#${this.getComponents(16).join('')}`;
        }

        toHexA () {
            return `#${this.getComponents(16, 16).join('')}`;
        }
    }

    window.Color = Color;

})();
