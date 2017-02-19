/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc')
	.factory('todoStorage', function ($http, $injector) {
		'use strict';

		// Detect if an API backend is present. If so, return the API module, else
		// hand off the localStorage adapter
		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('localStorage');
			});
	})

	.factory('api', function ($resource) {
		'use strict';

		var store = {
			todos: [],

			api: $resource('/api/todos/:id', null,
				{
					update: { method:'PUT' }
				}
			),

			clearCompleted: function () {
				var originalTodos = store.todos.slice(0);

				var incompleteTodos = store.todos.filter(function (todo) {
					return !todo.completed;
				});

				angular.copy(incompleteTodos, store.todos);

				return store.api.delete(function () {
					}, function error() {
						angular.copy(originalTodos, store.todos);
					});
			},

			delete: function (todo) {
				var originalTodos = store.todos.slice(0);

				store.todos.splice(store.todos.indexOf(todo), 1);
				return store.api.delete({ id: todo.id },
					function () {
					}, function error() {
						angular.copy(originalTodos, store.todos);
					});
			},

			get: function () {
				return store.api.query(function (resp) {
					angular.copy(resp, store.todos);
				});
			},

			insert: function (todo) {
				var originalTodos = store.todos.slice(0);

				return store.api.save(todo,
					function success(resp) {
						todo.id = resp.id;
						store.todos.push(todo);
					}, function error() {
						angular.copy(originalTodos, store.todos);
					})
					.$promise;
			},

            insertCard: function (card) {
				var originalCards = store.cards.slice(0);

				return store.api.save(card,
					function success(resp) {
						card.id = resp.id;
						store.cards.push(card);
					}, function error() {
						angular.copy(originalCards, store.cards);
					})
					.$promise;
			},



			put: function (todo) {
				return store.api.update({ id: todo.id }, todo)
					.$promise;
			}
		};

		return store;
	})

	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'todos-angularjs';
        var STORAGE_ID_CARDS = 'cards-angularjs';

		var store = {
			cards: [],
			

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

            _getCardsFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID_CARDS) || '[]');
			},

			_saveToLocalStorage: function (todos) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
			},

			_saveCardsToLocalStorage: function (cards) {
				localStorage.setItem(STORAGE_ID_CARDS, JSON.stringify(cards));
			},

			clearCompleted: function () {
				var deferred = $q.defer();

				var incompleteTodos = store.todos.filter(function (todo) {
					return !todo.completed;
				});

				angular.copy(incompleteTodos, store.todos);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			delete: function (card) {
				var deferred = $q.defer();

				store.cards.splice(store.cards.indexOf(card), 1);

				store._saveCardsToLocalStorage(store.cards);
				deferred.resolve(store.cards);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				//angular.copy(store._getFromLocalStorage(), store.todos);
				angular.copy(store._getCardsFromLocalStorage(), store.cards);
				deferred.resolve(store.cards);

				return deferred.promise;
			},


			insert: function (todo, cardIndex) {
				var deferred = $q.defer();
                 //store.todos.push()
				store.cards[cardIndex].push(todo);

				store._saveCardsToLocalStorage(store.cards);
				deferred.resolve(store.cards);

				return deferred.promise;
			},

			 insertCard: function (card) {
				var deferred = $q.defer();

				store.cards.push(card);

				store._saveCardsToLocalStorage(store.cards);
				deferred.resolve(store.cards);

				return deferred.promise;
			},


			put: function (card, index) {
				var deferred = $q.defer();

				//store.todos[index] = todo;
				store.cards[index] = card;

				//store._saveToLocalStorage(store.todos);
				store._saveCardsToLocalStorage(store.cards);
				deferred.resolve(store.todos);

				return deferred.promise;
			}
		};

		return store;
	});
