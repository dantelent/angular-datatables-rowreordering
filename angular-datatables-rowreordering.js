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
			result.DataTable.on('row-reorder', function (e, diff, edit) {
				options.rowReorder.evt(e, diff, edit);
			});
		}
	}
}