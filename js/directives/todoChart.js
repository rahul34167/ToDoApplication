/*global angular */

/**
 * Directive that executes an expression when the element it is applied to gets
 * an `escape` keydown event.
 */
angular.module('todomvc')
	     .directive('hcChart', function () {
                return {
                    restrict: 'E',
                    template: '<div></div>',
                    scope: {
                        options: '='
                    },
                    link: function (scope, element) {
                        Highcharts.chart(element[0], scope.options);
                    }
                };
            })
