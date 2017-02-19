/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, store) {
		'use strict';



var cards = $scope.cards= store.cards;

function showChart()
{

		   $scope.chartOptions = {
                    title: {
                        text: 'Task Tracker'
                    },
                    series: [{
                        data: []
                    }],
                     yAxis: [{ // Primary yAxis
						        title: {
						          text: 'Number of tasks',
						        }
						      }],
				     xAxis: [{ // Primary yAxis
						        title: {
						          text: 'Completion Time',
						        }
						      }],


                };
		//var todos = $scope.todos = store.todos;
		
        var seriesArray = $scope.chartOptions.series;
	  




     function calculateCount(arr) {
			    var a = [], b = [], prev;
			    
			    arr.sort();
			    for ( var i = 0; i < arr.length; i++ ) {
			        if ( arr[i] !== prev ) {
			            a.push(arr[i]);
			            b.push(1);
			        } else {
			            b[b.length-1]++;
			        }
			        prev = arr[i];
			    }
			    
			    return [a, b];
			}


        var taskTimeArray =[];
 
        for (var i=0;i<cards.length;i++)
        {
           var taskListGraph = cards[i].taskList;
           for(var j=0;j<taskListGraph.length;j++)
             {
                  if(taskListGraph[j].completed == true)
                 { 

                 	//Math.floor((diff/1000)/60)
                 	var timeinHours = Math.floor((Math.abs(Date.parse(taskListGraph[j].completedAt) -Date.parse(taskListGraph[j].createdAt)) /1000)/60);
                     
                           
                 // var timeinSeconds =  (taskListGraph[j].completedAt.getTime() - taskListGraph[j].createdAt.getTime()) / 1000;
                  taskTimeArray.push(timeinHours); 
                 }
             }
        }

           var returnArray = calculateCount(taskTimeArray);

           for(var k=0;k<returnArray[0].length;k++)
            {
                     seriesArray[0].data.push([returnArray[0][k], returnArray[1][k]]);
            }

       $scope.$apply();


        }

        showChart();

		$scope.newTodo = '';
		$scope.editedTodo = null;
		$scope.cardArray=[];
		$scope.newCard = '';

         //  document.getElementById("add-task-id").value = "";
		/*$scope.$watch('todos', function () {
			$scope.remainingCount = $filter('filter')(todos, { completed: false }).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true); */

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';
			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : {};

		});



        $scope.addCard = function()
        {
          
            var addNewCard = {
            	title: $scope.newCardName.trim(),
            	deleted:false,
	            taskList:[]
            }

            if (!addNewCard.title) {
				return;
			}

           	$scope.saving = true;
			store.insertCard(addNewCard)
				.then(function success() {
					$scope.newCardName = '';
				})
				.finally(function () {
					$scope.saving = false;
				});

          
        };


     
		$scope.addTodo = function (cardToAdd) {

            var cardIndex = cards.indexOf(cardToAdd);
            var cardTitle = cardToAdd.title;
            var datetimeNow = new Date();
          /*  var completedTime = new Date();
            completedTime.setHours ( datetimeNow.getHours() + 6 ); */
            
			var tasktitleis = document.getElementById('task-'+cardTitle).value;

			var newTask = {
				tasktitle: tasktitleis,
				completed: false,
				createdAt: datetimeNow,
				completedAt: datetimeNow
			};

			
			
			if (!newTask.tasktitle) {
				return;
			}
              cardToAdd.taskList.push(newTask);

			$scope.saving = true;
			store.put(cardToAdd,cardIndex)
				.then(function success() {
					$scope.newTodo = '';
					showChart();
				})
				.finally(function () {
					$scope.saving = false;
				});
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};

		$scope.saveEdits = function (todo, event) {
			// Blur events are automatically triggered after the form submit event.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// Todo edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			todo.title = todo.title.trim();

			if (todo.title === $scope.originalTodo.title) {
				$scope.editedTodo = null;
				return;
			}

			store[todo.title ? 'put' : 'delete'](todo)
				.then(function success() {}, function error() {
					todo.title = $scope.originalTodo.title;
				})
				.finally(function () {
					$scope.editedTodo = null;
				});
		};

		$scope.revertEdits = function (todo) {
			todos[todos.indexOf(todo)] = $scope.originalTodo;
			$scope.editedTodo = null;
			$scope.originalTodo = null;
			$scope.reverted = true;
		};

		$scope.removeTodo = function (todo,card) {

			//store.delete(todo);
            var taskIndex = card.taskList.indexOf(todo);
           // card.taskList[taskIndex].completedAt = new Date();

			if (taskIndex > -1) {
           card.taskList.splice(taskIndex, 1);

           var cardIndex = cards.indexOf(card);

           $scope.saving = true;
			store.put(card,cardIndex)
				.then(function success() {
					$scope.newTodo = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
}

		};




         $scope.deleteCard = function (card) {

           $scope.saving = true;
			store.delete(card)
				.then(function success() {
					$scope.newTodo = '';
				})
				.finally(function () {
					$scope.saving = false;
				});
};

		





		$scope.saveTodo = function (todo) {
			store.put(todo);
		};

		$scope.toggleCompleted = function (todo,card, completed) {

            var taskIndex = card.taskList.indexOf(todo);
            card.taskList[taskIndex].completedAt = new Date();
            var cardIndex = cards.indexOf(card);

			if (angular.isDefined(completed)) {
				todo.completed = completed;
			}
			store.put(card, cardIndex)
				.then(function success() {
					$scope.newTodo = '';
					showChart();
				}, function error() {
					todo.completed = !todo.completed;
				});
		};

		$scope.clearCompletedTodos = function () {
			store.clearCompleted();
		};

		$scope.markAll = function (completed) {
			todos.forEach(function (todo) {
				if (todo.completed !== completed) {
					$scope.toggleCompleted(todo, completed);
				}
			});
		};
	});
