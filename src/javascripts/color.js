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

    const hueToRgb = (p, q, t) => {
        t = t + (t < 0) - (t > 1);
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    };

    const hslToRgb = (h, s, l) => {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            let q = (l < 0.5) ? (l * (s + 1)) : (s + l - s * l),
                p = 2 * l - q;
            r = hueToRgb(p, q, h + 1/3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };

    const rgbToHsl = (r, g, b) => {
        r /= 255.0; g /= 255.0; b /= 255.0;
        let max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            h, s, l = (max + min) / 2.0;

        if (max === min) {
            h = s = 0;
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + ( g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
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

    const parseHSLA = (color) => {
        let matches, h, s, l, a = 1;

        if (matches = color.match(/hsl\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)) {
            h = parseInt(matches[1]) / 240.0;
            s = parseInt(matches[2]) / 240.0;
            l = parseInt(matches[3]) / 240.0;
        } else if (matches = color.match(/hsla\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d\.]+)\s*\)/i)) {
            h = parseInt(matches[1]) / 240.0;
            s = parseInt(matches[2]) / 240.0;
            l = parseInt(matches[3]) / 240.0;
            a = parseFloat(matches[4]);
        } else {
            return;
        }

        let [r, g, b] = hslToRgb(h, s, l);

        checkComponent('red', r);
        checkComponent('green', g);
        checkComponent('blue', b);
        checkComponent('alpha', a, 1);

        return { red: r, green: g, blue: b, alpha: a * 255 }
    };

    class Color {

        constructor (color) {
            this.channel = undefined;

            if (typeof color === 'string') {
                this.channel = parseHex(color) || parseRGBA(color) || parseHSLA(color);
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
                let method = format === 16 ? 'unshift' : 'push';
                components[method](this.getAlpha(alphaFormat));
            }
            return components;
        }

        toRGB () {
            return `rgb(${this.getComponents(10).join(', ')})`;
        }

        toHSL () {
            let [r, g, b] = this.getComponents(10),
                [h, s, l] = rgbToHsl(r, g, b);
            return `hsl(${Math.floor(h * 240)}, ${Math.floor(s * 240)}, ${Math.floor(l * 240)})`;
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
