/*global exports */
/**
    A module representing a Cold object.
    @module Cold
 */

/**
 * Creates a new Cold object.
 *
 * @constructor
 * @extends Mover
 *
 * @param {Object} [opt_options] Options.
 * @param {number} [opt_options.mass = 50] Mass. Increase for a greater gravitational effect.
 * @param {boolean} [opt_options.isStatic = true] If true, object will not move.
 * @param {number} [opt_options.width = 20] Width.
 * @param {number} [opt_options.height = 20] Height.
 * @param {number} [opt_options.opacity = 0.5] Opacity.
 */
function Cold(opt_options) {

  'use strict';

  var options = opt_options || {};

  exports.Mover.call(this, options);

  this.mass = options.mass === 0 ? 0 : options.mass || 50;
  this.isStatic = options.isStatic === false ? false : options.isStatic || true;
  this.width = options.width === 0 ? 0 : options.width || 20;
  this.height = options.height === 0 ? 0 : options.height || 20;
  this.opacity = options.opacity === 0 ? 0 : options.opacity || 0.5;
}
exports.Utils.inherit(Cold, exports.Mover);

/**
 * Define a name property. Used to assign a class name and prefix an id.
 */
Cold.name = 'cold';

exports.Cold = Cold;