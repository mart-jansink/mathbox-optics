// add a Value primitive to animate arbitrary values
MathBox.Value = function (options) {
  // Allow inheritance constructor
  if (options === null) return;
  MathBox.Primitive.call(this, options);
};

MathBox.Value.prototype = _.extend(new MathBox.Primitive(null), {
  defaults: function () {
    return {
      live: true,
      value: 0,
      style: {},
    };
  },

  type: function () {
    return 'value';
  },

  adjust: function (viewport) {
    var options = this.get();
    if (options.live) {
      var value = options.value;

      options.modulus && ( value = value % options.modulus );
      options.key && ( window[options.key] = value );
      (typeof options.callback === "function") && options.callback.call(this, value);
    }
  }
});

MathBox.Primitive.types.value = MathBox.Value;




// allow arbitrary functions to be called from the script.

/**
 * Invert the given operation (which hasn't been applied yet).
 */
MathBox.Director.prototype.invert = function (op) {
  var stage = this._stage;

  var inverse = [],
      targets;

  var verb = op[0],
      selector = op[1],
      options = op[2] || {},
      animate = op[3],
      primitive;

  if (verb == 'remove') {
    animate = options;
  }

  // Reverse timings
  var duration = (animate && animate.duration !== undefined) ? animate.duration / 4 : 0;
  var delay = (animate && animate.delay !== undefined) ? animate.delay / 4 : 0;
  var hold = (animate && animate.hold !== undefined) ? animate.hold / 4 : 0;
  animate = { delay: hold, duration: duration, hold: delay };

  switch (verb) {
    case 'add':
      targets = [0];
      // Fall through
    case 'clone':
      targets = targets || stage.select(selector);
      _.each(targets, function (target, i) {
        inverse.push([
          'remove',
          options.sequence || (MathBox.Primitive.sequence + 1 + i),
          animate,
        ]);
      })
      break;

    case 'remove':
      targets = stage.select(selector);
      _.each(targets, function (primitive) {
        inverse.push([
          'add',
          primitive.type(),
          stage.get(primitive),
          animate,
        ]);
      })
      break;

    case 'animate':
    case 'set':
      targets = stage.select(selector);

      _.each(targets, function (primitive) {
        var props = stage.get(primitive);
        var reverted = {};
        for (i in options) {
          if (props.style && props.style[i] !== undefined) reverted[i] = props.style[i];
          else reverted[i] = props[i];
        }
//          log('reverted', props, options, reverted)

        inverse.push([
          verb,
          primitive.singleton || primitive.get('sequence'),
          reverted,
          animate,
        ]);
      });
      break;

    case 'call':
      inverse.push([
        'call',
        function(){selector.call(this,true)}
      ]);
      break;
  }

  return inverse;
}

/**
 * Apply the given script step.
 */
MathBox.Director.prototype.apply = function (step, rollback, instant, skipping) {
  var stage = this._stage;

  _.each(step, function (op) {
    var verb = op[0] || '',
        selector = op[1] || '',
        options = op[2] || {},
        animate = op[3] || {};

    if (verb == 'remove') animate = options;

    if (rollback) {
      var inverse = this.invert(op);
      var args = [0, 0].concat(inverse);
      Array.prototype.splice.apply(rollback, args);
    }

    if (skipping) {
      if (animate) {
        animate = _.extend({}, animate);
        animate.delay = animate.delay / 2;
        animate.duration = animate.duration / 2;
        animate.hold = animate.hold / 2;
      }
    }
    if (instant) {
      animate = { delay: 0, duration: 0, hold: 0 };
      if (verb == 'animate') {
        verb = 'set';
      }
    }

    switch (verb) {
      case 'clone':
        stage.clone(selector, options, animate);
        break;

      case 'add':
        var primitive = stage.spawn(selector, options, animate);
        break;

      case 'remove':
        _.each(stage.select(selector), function (primitive) {
          stage.remove(primitive, animate);
        });
        break;

      case 'set':
        var targets = stage.select(selector);
        var array = options.constructor == Array;
        _.each(targets, function (target, i) {
          stage.set(target, array ? options[i] : options);
        });
        break;

      case 'animate':
        var targets = stage.select(selector);
        var array = options.constructor == Array;
        _.each(targets, function (target, i) {
          var opts = array ? options[i] : options;
          stage.animate(target, opts, animate);
        });
        break;

      case 'call':
        selector.call(this);
        break;
    }
  }.bind(this));

  return this;
}