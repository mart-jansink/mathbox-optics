// GENERAL SETTINGS

var duration = {
  duration: 150
}

var colors = {
  black: 0x000000,
  white: 0xffffff,
  gray: 0x7f7f7f,

  purple: 0xb040d0,
  green: 0x20c050,
  blue: 0x3070f0,
  red: 0xc02050,
}



// PROPAGATION

var wavePropagation = 0;
var propagation = {
  running: false,

  isStarting: false,

  shouldStop: false,
  isStopping: false,
}
function togglePropagation() {
  if ( !propagation.running && !propagation.isStarting ) {
    propagation.isStarting = true;
    // reset the clock
    director.clock( 0, true );
  }
  else {
    propagation.shouldStop = true;
  }
}



// CAMERA ORIENTATIONS

var cameras = {
  front: {
    orbit: 3.5,
    phi: τ/4,
    theta: 0,
  },

  top: {
    orbit: 3.5,
    phi: τ/4,
    theta: τ/4,
  },

  right: {
    orbit: 3.5,
    phi: 0,
    theta: 0,
  },

  "3D": {
    orbit: 1.5,
    phi: π / 4,
    theta: π / 8
  }
}
function changeCamera( camera ) {
  mathbox.animate( "camera", cameras[ camera ], duration );
}



// RANGE INPUTS

function handleRange( selector, modifier, fn, args ) {
  var numberOfChanges = 0;
  $( selector ).bind( "input", function( event ) {
    // flag whether we're dragging or not, to animate or set the phase
    fn.apply( window, [ modifier( this.value ), !numberOfChanges++ ].concat( args || [] ) );
  } ).mousedown( function() {
    numberOfChanges = 0;
  } ).mouseup( function() {
    // blur the slider to regain slide control with the arrow keys
    this.blur();
  } )
}



// KEYBOARD CONTROLS

// next step
jwerty.key( "→", function() {
  director.forward();
} );
// previous step
jwerty.key( "←", function() {
  director.back();
} );

// propagation
jwerty.key( "W", function() {
  togglePropagation();
} );

// front camera
jwerty.key( "C,F", function() {
  changeCamera( "front" );
} );
// top camera
jwerty.key( "C,T", function() {
  changeCamera( "top" );
} );
// right camera
jwerty.key( "C,R", function() {
  changeCamera( "right" );
} );
// 3D camera
jwerty.key( "C,3", function() {
  changeCamera( "3D" );
} );
      