# Kobol #

An HTML5 demo of a spaceship learning to navigate an asteroid field using Q-Learning, relying only on simulated radar inputs and basic telemetry (speed, directional vector, yaw)

The demo was built using [Convnetjs](http://cs.stanford.edu/people/karpathy/convnetjs/) & [Phaser](http://phaser.io/).

> [See the demo](http://26medias.github.io/Kobol/game/)


## Training ##
It takes a few hours to train. If you let it run overnight, you'll see a spaceship with a stable flight and a real fear of asteroids.

In its current form, the ship's code includes a pre-trainet net, which is loaded by default.
That also disables the learning.

If you wish to train the ship, you'll have to comment the property `this.trainedNet` in ship.js' contructor.

Various trained networks are included in the `game/nets` directory.


## input, reward and output ##

The inputs are:
- The radar value
- The velocity
- the amount of yaw to the right
- the amount of yaw to the left

The ship is rewarded (positive reward) for flying straight, pointing the radar in the direction it's heading, and flying at a decent speed.
The ship is punished (negative reward) for having an asteroid in its radar reading (the closer the asteroid, the greater the punishment), for pointing the radar away from where it's heading, or for flying too slow.

The reward is given at least 100ms after the network outputs an action, to let some time for the action to take effect.

The radar is simulated using 8 lines of 7 dots each, arranged on a 45° arc extending in front of the ship, displayed as shiny green lights.
For each dot, an event is triggered if there is an overlap with an object.
Each line is represented as a value on the [0;1] range where the value is close to 1 if a sensor near the ship is overlapping with an object, near 0 if the overlap is far away from the ship.
That gives us 8 inputs, each on the [0;1] range to represent the radar.

The velocity is also represented on the [0;1] range, with 1 representing the max possible speed the ship can attain.

The yaw is represented using 2 values. If the ship's angle relative to its directional vector is 0 (the ship is pointing its nose toward where it's heading),  then the 2 yaw values are set to 0.
If the ship is pointing to the left, then the left yaw value would be on the range [0;1], with the value closer to 1 if the ship is close to 180° away from its directional vector while the right yaw would be set to 0. Same goes in the other direction.

The output is one of 4 possible actions:
- Do nothing
- Turn left
- Turn right
- Accelerate

It should be noted that turning right or left only points the ship toward that direction, it won't turn until some acceleration is provided.


## Results ##
The ship successfully learns to turn away from asteroids, and in which direction.
It also learns to control its speed.

However, because of its inertia, and because of a lack of input when the ship hits an asteroid, the ship doesn't always succeed in avoiding a collision. When a collision does happens, it's almost always a side collision due to side drifting. With additional inputs (radar pointing on the sides?) and more advanced output options, it would be possible to get a much better control over its path.

## Inspiration ##

This demo was inspired by [ConvNetJS Deep Q Learning Demo](http://cs.stanford.edu/people/karpathy/convnetjs/demo/rldemo.html).

