# MultiVideoJS

DISCLAIMER: This project hasn't been updated nor checked since 2016. It has been recently republished due to an account change.

MultiVideoJS is a plugin for jQuery that creates a video player in your site. It allows multiple videos to behave as one single video in a player, without actually having to join and process them. It also allows to select fragments of videos (or even fragments of the same video). It supports HTML5 video and modern streaming formats, as well as YouTube. The core of MultiVideoJS works with video.js, youtube.js and YouTube's video API.

## Getting started 🚀

Follow these instructions to use MultiVideoJS on your project.


### Pre-requisites 📋

Make sure you have installed all of the following prerequisites on your development and production machines:

* jQuery - [Download jQuery](https://jquery.com/download/). Of course, being a jQuery plugin, MultiVideoJS needs jQuery to work.
* Video.js - [Download Video.js](https://github.com/videojs/video.js). MultiVideoJS requires the video.js player.
* Youtube.js - [Download Youtube.js](https://videojs.com/plugins). MultiVideoJS requires the Video.js's Youtube.js player.

### Installation 🔧

Include MultiVideoJS's .js and .css files on your page, after its requirements:

```html
<link rel="stylesheet" type="text/css" href="MultiVideo.css">
<script src="MultiVideo.js"></script>
```


### Initialization 📦

The MultiVideoJS needs to be initiated when the target DOM element is ready. The safest bet is to start it on window `onload` event or jQuery's document.ready, but it can also be launched on a script tag positioned below the element.

To sum up, the smallest MultiVideoJS configuration is:

```html
<head>
...
</head>
<body>
	<div id="myDiv"></div>
	<script>
		var myP = $('#myDiv').MultiVideoJS({
			sources: [
				{
					type: "video/youtube",
					src: "https://youtu.be/E9jrQSpMxes",
					ini: 200,
					end: 210
				}, {
					type: "video/youtube",
					src: "https://youtu.be/YPWcs2odleA",
					ini: 60,
					end: 70
				}
			],
			poster: 'url("https://images.unsplash.com/photo-1429277096327-11ee3b761c93?crop=entropy&dpr=2&fit=crop&fm=jpg&h=800&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1350")',
			width: 800
		});
	</script>
</body>
```


## Configuring the MultiVideoJS ⚙️

MultiVideoJS can be configured by passing an object of option - value pairs during the initialization phase.

```js
var myP = $('#myDiv').MultiVideoJS({
	sources: [
		{
			type: "video/youtube",
			src: "https://youtu.be/E9jrQSpMxes",
			ini: 200,
			end: 210
		}, {
			type: "video/youtube",
			src: "https://youtu.be/YPWcs2odleA",
			ini: 60,
			end: 70
		}
	],
	poster: 'url("https://images.unsplash.com/photo-1429277096327-11ee3b761c93?crop=entropy&dpr=2&fit=crop&fm=jpg&h=800&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1350")',
	width: 800
});
```

Settings can also be changed or first set by passing the option key and the value as two parameters.

```js
$('#myDiv').MultiVideoJS('width', 800);
```


## Docs 📖

In this section you can read about the options, events and methods of this plugin.

### Options

#### **options.poster: `string`**

Path to the image that will appear onscreen before and after the sequence of videos have been played.

default: `null`

#### **options.sources: `array of objects` (required)**

Each object in the array represents a source and contains:

* src `string` (required): path to the video or youtube url.
* type `string` (required): media type (‘video/mp4’, ‘video/youtube’, …)
* ini `number`: start position in seconds.
* end `number`: end position in seconds.

#### **options.fixedControls: `bool`**

If true, the video controls are displayed in a fixed position under the player, else, they’re displayed inside the video box when the mouse moves.

default: `false`

#### **options.autoplay: `bool`**

If true, the video reproduction starts when the player is ready.

default: `false`

#### **options.width: 'string / number'**

If both are specified, both will be respected.
If only one is specified, the other value will be computed to respect 16:9 aspect ratio.
Otherwise, the default values will be applied.

default: `800px`

#### **options.height: 'string / number'**

If both are specified, both will be respected.
If only one is specified, the other value will be computed to respect 16:9 aspect ratio.
Otherwise, the default values will be applied.

default: `450px`

#### **options.extraControls: `array of objects`**

Each object in the array represents a custom button with its action and contains:

* callback `function` (required): callback function that will be executed when button is clicked.
* id `string`: Id attribute of the HTML element.
* class `string`: Class attribute of the HTML element.

default: `null`


### Custom events

MultiVideoJS emits some custom events you can hook to.

To register them you use the `on(type, fn)` method.

```js
var myDiv = $('#myDiv').MultiVideoJS({...});

myDiv.on('refreshed', doSomething);
```

The available events are:

* **ready**: This event is triggered when the player is ready for reproduction.
* **ended**: This event is triggered when the last video in the sources finishes its reproduction
* **nextVideo**: This event is triggered when any video in the sources but the last finishes its reproduction and the following video starts its own.
* **playing**: This event gets triggered while the video is playing.


### Methods

#### **addControl**

Adds a custom button to the player that will execute a callback function when clicked.

* **button** (object) An object representing the custom button as:
	* **callback** (function): Callback function that will be executed when button is clicked.
	* **id** (string): Id attribute of the HTML element.
	* **class** (string): Class attribute of the HTML element.

Returns: `bool` If button was successfully added, returns true. Otherwise returns false.

#### **removeControl**

Removes a custom button from the player.

* **selector** (string, required) Selector of the custom button which will be removed from the player.

Returns: `bool` If button was successfully removed, returns true. Otherwise returns false.

#### **index**

Get the index of the source currently being played.

* This method does not accept any arguments.

Returns: `number` Number from 0 to Sources.length-1.

#### **getAspectRatio**

Get the current aspect ratio of the player.

* This method does not accept any arguments.

Returns: `number` Number describing the aspect ratio as width / height.

#### **getVideos**

Get the video sources of the player.

* This method does not accept any arguments.

Returns: `Array` An array of objects in which every object represents a source.

#### **getBufferedFraction**

Get the fraction (as a decimal) of the video that's been downloaded.

* This method does not accept any arguments.

Returns: `number` Decimal from 0 to 1.

#### **currentTime**

Set or get the current time (in seconds).

* **time** (number, optional): The time to seek to.

Returns: `number` Current time in seconds.

#### **getCurrentTimeInVideo**

Get the current time in the original source, without taking in consideration ini and end times.

Returns: `number` The current time.

#### **currentFraction**

Set or get the current time as a fraction (decimal from 0 to 1).

* **fraction** (number): The fraction to seek to (decimal from 0 to 1).

Returns: `number` Decimal from 0 to 1.

#### **duration**

Get the duration in seconds of the sequence of videos.

* This method does not accept any arguments.

Returns: `number` Duration of the video.

#### **ended**

Get if the sequence of videos has ended.

* This method does not accept any arguments.

Returns: `bool`

#### **fixedControls**

Set or get the state of the fixedControls configuration option.

* **fixedControls** (bool): If true, the video controls will be displayed in a fixed position under the player, else, they’re displayed inside the video box when the mouse moves.

Returns: `bool`

#### **getFormatTime**

Get the current time and duration formatted to be displayed.

* This method does not accept any arguments.

Returns: `string` String as “curr_min:curr_sec / dur_min:dur_sec”.

#### **isPlaying**

Check if the player is playing.

* This method does not accept any arguments.

Returns: `bool`

#### **isNotLast**

Check if the current video is the last in the sources sequence.

* This method does not accept any arguments.

Returns: `bool`

#### **muted**

Set or get the muted state.

* **muted** (bool): If true, the videos will be muted. If false, the videos will be unmuted.

Returns: `bool`

#### **toggleMuted**

Invert the muted state and return it.

* This method does not accept any arguments.

Returns: `bool`

#### **pause**

Pause the video.

* This method does not accept any arguments.

#### **play**

Play the video.

* This method does not accept any arguments.

#### **togglePlay**

If video is playing, it pauses it. Otherwise it plays it.

* This method does not accept any arguments.

#### **poster**

Set or get the value of the poster configuration option.

* **path** (string): The path to the new poster image.

Returns: `string` The path to the poster image.

#### **getRemainingTime**

Get the remaining time until the end of the video sequence (in seconds).

* This method does not accept any arguments.

Returns: `number` The remaining time.

#### **volume**

Set or get the volume.

* **volume** (number): The volume fraction (decimal from 0 to 1).

Returns: `number` Decimal from 0 to 1

#### **speed**

Set or get the playback rate (video speed).

* **speed** (number): A number representing the rate in proportion to the video’s default. For instance speed(2) would make the video play twice as fast. Accepted values go from 0.5 to 5.0.

Returns: `number` Decimal from from 0.5 to 5.0.

#### **zoom**

Set or get the zoom size.

* **speed** (number): A decimal number greater or equal than 1, being 1 the default value, which would mean that there’s no zoom applied.

Returns: `number` Decimal number greater or equal than 1.

#### **zoomMove**

Set or get the zoom position.

* **x** (number): A decimal number from -1.0 to 1.0; meaning 1 maximum left and -1 maximum right.
* **y** (number): A decimal number from -1.0 to 1.0; meaning 1 maximum top and -1 maximum bottom.

Returns: `object` Object containing the current x and y values.

#### **zoomMove**

Set or get the zoom position.

* **move** (object) An object containing the coordinates as:
	* **x** (number): A decimal number from -1.0 to 1.0; meaning 1 maximum left and -1 maximum right.
	* **y** (number): A decimal number from -1.0 to 1.0; meaning 1 maximum top and -1 maximum bottom.

Returns: `object` Object containing the current x and y values.

#### **sourcesFull**

Get the sources object after initialization has been applied.

* This method does not accept any arguments.

Returns: `object` Object containing the sources and the ini and end values for each.

#### **timeOffset**

Set or get the seconds that will be added to the current time in the control panel.

* **offset** (number): The seconds that will be added (or subtracted, if negative).

Returns: `number` Decimal representing the current offset.

#### **showTimeAsCurrent**

Forces the time that will be displayed in the control box as current time.

* **seconds** (number): The seconds that will be displayed.

#### **noShowTimeAsCurrent**

In case showTimeAsCurrent had been set, it unsets it, allowing the real time to appear in the control box.


## License (MIT) 📄

Copyright (c) 2016 Borja García Quiroga

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
