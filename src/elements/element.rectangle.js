"use strict";

module.exports = function(Chart) {

	var borderRadius = true; // make an optional setting laters

	var globalOpts = Chart.defaults.global;

	globalOpts.elements.rectangle = {
		backgroundColor: globalOpts.defaultColor,
		borderWidth: 0,
		borderColor: globalOpts.defaultColor,
		borderSkipped: 'bottom'
	};

	Chart.elements.Rectangle = Chart.Element.extend({
		draw: function() {
			var ctx = this._chart.ctx;
			var vm = this._view;

			var halfWidth = vm.width / 2,
				leftX = vm.x - halfWidth,
				rightX = vm.x + halfWidth,
				top = vm.base - (vm.base - vm.y),
				halfStroke = vm.borderWidth / 2;

			// Canvas doesn't allow us to stroke inside the width so we can
			// adjust the sizes to fit if we're setting a stroke on the line
			if (vm.borderWidth) {
				leftX += halfStroke;
				rightX -= halfStroke;
				top += halfStroke;
			}

			ctx.beginPath();
			ctx.fillStyle = vm.backgroundColor;
			ctx.strokeStyle = vm.borderColor;
			ctx.lineWidth = vm.borderWidth;
			ctx.borderRadius = borderRadius;

			// Corner points, from bottom-left to bottom-right clockwise
			// | 1 2 |
			// | 0 3 |
			var corners = [
				[leftX, vm.base],
				[leftX, top],
				[rightX, top],
				[rightX, vm.base]
			];

			// http://fiddle.jshell.net/leighking2/fmpu4gyt/

			// Find first (starting) corner with fallback to 'bottom'
			var borders = ['bottom', 'left', 'top', 'right'];
			var startCorner = borders.indexOf(vm.borderSkipped, 0);
			if (startCorner === -1)
				startCorner = 0;

			function cornerAt(index) {
				return corners[(startCorner + index) % 5];
			}

			// Draw rectangle from 'startCorner'
			ctx.moveTo.apply(ctx, cornerAt(0));

			if (!ctx.borderRadius) {

				for (var i = 1; i < corners.length; i++){
					ctx.lineTo.apply(ctx, cornerAt(i));
				}

			}
			else {
				ctx.lineTo( leftX, (top + 15) ); // [leftX, top]

				ctx.quadraticCurveTo( (leftX + 15), top, ( leftX + halfWidth ), top );
				ctx.quadraticCurveTo( ( leftX + halfWidth ), top, rightX, (top + 15) );

				ctx.lineTo.apply( ctx, corners[3] ); // [rightX, vm.base]
			}

			// http://www.w3schools.com/tags/canvas_beziercurveto.asp
			// http://www.w3schools.com/tags/canvas_quadraticcurveto.asp

			/*
				square edges:
				ctx.lineTo( leftX, (top + 15) );

				ctx.lineTo( (leftX + 15), top );
				ctx.lineTo( (rightX - 15), top );
				ctx.lineTo( rightX, (top + 15) );

				ctx.lineTo.apply( ctx, corners[3] );
			*/

			ctx.fill();

			if (vm.borderWidth) {
				ctx.stroke();
			}

		},
		height: function() {
			var vm = this._view;
			return vm.base - vm.y;
		},
		inRange: function(mouseX, mouseY) {
			var vm = this._view;
			return vm ?
					(vm.y < vm.base ?
						(mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2) && (mouseY >= vm.y && mouseY <= vm.base) :
						(mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2) && (mouseY >= vm.base && mouseY <= vm.y)) :
					false;
		},
		inLabelRange: function(mouseX) {
			var vm = this._view;
			return vm ? (mouseX >= vm.x - vm.width / 2 && mouseX <= vm.x + vm.width / 2) : false;
		},
		tooltipPosition: function() {
			var vm = this._view;
			return {
				x: vm.x,
				y: vm.y
			};
		}
	});

};
