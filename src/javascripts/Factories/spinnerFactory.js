export default function(ngapp) {
    ngapp.service('spinnerFactory', function() {
        this.defaultOptions ={
            lines: 17, // The number of lines to draw
            length: 0, // The length of each line
            width: 12, // The line thickness
            radius: 50, // The radius of the inner circle
            scale: 2, // Scales overall size of the spinner
            corners: 0, // Corner roundness (0..1)
            color: '#000', // #rgb or #rrggbb or array of colors
            opacity: 0.05, // Opacity of the lines
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            speed: 0.9, // Rounds per second
            trail: 70, // Afterglow percentage
            fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
            zIndex: 2, // The z-index (defaults to 2000000000)
            className: 'spinner', // The CSS class to assign to the spinner
            top: '50%', // Top position relative to parent
            left: '50%', // Left position relative to parent
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            position: 'relative' // Element positioning
        };
    })
}
