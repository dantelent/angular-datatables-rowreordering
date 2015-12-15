'use strict';

angular.module('datatables.rowreordering', ['datatables'])
    .config(dtRowReOrderingConfig)
    .run(initRowReOrderingPlugin);

/* @ngInject */
function dtRowReOrderingConfig($provide) {
	$provide.decorator('DTOptionsBuilder', dtOptionsBuilderDecorator);

	function dtOptionsBuilderDecorator($delegate) {
		var newOptions = $delegate.newOptions;
		var fromSource = $delegate.fromSource;
		var fromFnPromise = $delegate.fromFnPromise;

		$delegate.newOptions = function () {
			return _decorateOptions(newOptions);
		};
		$delegate.fromSource = function (ajax) {
			return _decorateOptions(fromSource, ajax);
		};
		$delegate.fromFnPromise = function (fnPromise) {
			return _decorateOptions(fromFnPromise, fnPromise);
		};

		return $delegate;

		function _decorateOptions(fn, params) {
			var options = fn(params);
			options.withRowReOrdering = withRowReOrdering;
			return options;

			/**
             * Add row-reorder support
             * @param rowReOrderingOptions the plugins options
             * @returns {DTOptions} the options
             */
			function withRowReOrdering(rowReOrderingOptions) {
				options.hasRowReOrdering = true;
				if (rowReOrderingOptions) {
					options.rowReorder = rowReOrderingOptions;
				}
				return options;
			}
		}
	}
}

/* @ngInject */
function initRowReOrderingPlugin(DTRendererService) {
	var rowReOrderingPlugin = {
		postRender: postRender
	};
	DTRendererService.registerPlugin(rowReOrderingPlugin);

	function postRender(options, result) {
		
		/* Subscribe to the row-reorder event and forward the call through to the function given in the options */
		if (options.rowReorder && options.rowReorder.evt) {
			result.DataTable.off('row-reorder');
			result.DataTable.on('row-reorder', function (e, diff, edit) {

				var clone = function (obj) {
					if (null == obj || "object" != typeof obj) return obj;
					var copy = obj.constructor();
					for (var attr in obj) {
						if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
					}
					return copy;
				}

				var changes = [],
					id,
					cl;

				/* To make things easier (for me) i'm extracting the id from the node item here and pushing it through to the caller as a new object so they don't have to worry about DOM manipulation */
				for (var i = 0; i < diff.length; i++) {
					id = angular.element(diff[i].node).attr('id');
					cl = clone(diff[i]);
					cl.id = id;
					changes.push(cl);
				}

				options.rowReorder.evt(e, diff, edit, changes);
			});
		}
	}
}