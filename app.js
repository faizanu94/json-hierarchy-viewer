angular.module("json-hierarchy-viewer", ['ui.codemirror']).directive('collection', function () {
	return {
		restrict: "E",
		replace: true,
		scope: {
			collection: '=',
			show: "="
		},
		templateUrl: 'templates/collection.tpl.html',
		link: function (scope) {
			scope.notSorted = function (obj) {
				return !obj ? [] : Object.keys(obj);
			};
		}
	}
}).directive('member', function ($compile) {
	return {
		restrict: "E",
		replace: true,
		scope: {
			member: '='
		},
		templateUrl: 'templates/member.tpl.html',
		link: function (scope, element, attrs) {
			const collectionSt = '<span class="size" ng-show="getSize()>-1"> {{getSizeText()}}</span><span class="type">[{{getType()}}]</span><collection collection="member.value"></collection>';
			const primitiveTemplate = '<span class="value {{getType()}}"> <a ng-show="isUrl()" href="{{member.value}}" target="_blank">{{member.value}}</a><span ng-show="!isUrl()">{{member.value}}</span> </span><span class="type">[{{getType()}}]</span>';
			scope.primitive = false;

			scope.isUrl = function () {
				return _.isString(scope.member.value) ? scope.member.value.match(/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+(?![^\s]*?")([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/ig) != null : false;
			}
			if (_.isArray(scope.member.value) || _.isObject(scope.member.value)) {
				scope.primitive = false;
				$compile(collectionSt)(scope, function (cloned, scope) {
					element.append(cloned);
				});
			} else {
				scope.primitive = true;
				$compile(primitiveTemplate)(scope, function (cloned, scope) {
					element.append(cloned);
				})
			}

			scope.getType = function () {
				if (_.isArray(scope.member.value))
					return "array";
				else if (_.isNumber(scope.member.value))
					return "number";
				else if (_.isString(scope.member.value))
					return "string";
				else if (_.isBoolean(scope.member.value))
					return "boolean";
				else
					return "object";
			}

			scope.getSize = function () {
				return _.isArray(scope.member.value) ? scope.member.value.length : (_.isObject(scope.member.value) ? getSize(scope.member.value) : -1);
			}

			scope.getSizeText = function () {
				return _.isArray(scope.member.value) ? "[" + scope.member.value.length + "]" : (_.isObject(scope.member.value) ? "{" + getSize(scope.member.value) + "}" : "");
			}

			scope.getElementHierarchy = function (element) {
				let hierarchy = "";

				while (element != null) {
					if (element.member) {
						if (!isNaN(element.member.name)) {
							hierarchy = "[" + element.member.name + "]" + " > " + hierarchy;
							element = scope.getKey(element);
							hierarchy = element.member.name + hierarchy;
						}
						else
							hierarchy = element.member.name + " > " + hierarchy;
					}
					element = element.$parent;
				}
				return hierarchy.substr(0, hierarchy.length - 3);
			}

			scope.getKey = function (element) {
				while (element != null) {
					if (element.member && isNaN(element.member.name))
						return element;
					element = element.$parent;
				}
			}
			scope.show = true;
			scope.toggleShow = function () {
				element.find("i").toggleClass("fa-plus-square");
				element.find("i").toggleClass("fa-minus-square");
				element.find("ul").toggleClass("hide");
			}
		}
	}
}).controller("JSONHierarchyViewerController", function ($scope) {
	$scope.editorOptions = {
		lineWrapping: true,
		lineNumbers: true,
		mode: "application/json",
		theme: "mbo",
		lint: true,
		styleActiveLine: true,
		matchBrackets: true,
		mime: "application/json",
		gutters: ["CodeMirror-lint-markers"]
	};

	$scope.data = { "id": 411031503817039874, "id_str": "411031503817039874", "text": "test $TWTR @twitterapi #hashtag http:\/\/t.co\/p5dOtmnZyu https:\/\/t.co\/ZSvIEMOPb8", "created_at": "Thu Dec 12 07:15:21 +0000 2013", "entities": { "hashtags": [{ "text": "hashtag", "active": true, "indices": [23, 31] }], "symbols": [{ "text": "TWTR", "indices": [5, 10] }], "urls": [{ "url": "http:\/\/t.co\/p5dOtmnZyu", "expanded_url": "http:\/\/dev.twitter.com", "display_url": "dev.twitter.com", "indices": [32, 54] }, { "url": "https:\/\/t.co\/ZSvIEMOPb8", "expanded_url": "https:\/\/ton.twitter.com\/1.1\/ton\/data\/dm\/411031503817039874\/411031503833792512\/cOkcq9FS.jpg", "display_url": "pic.twitter.com\/ZSvIEMOPb8", "indices": [55, 78] }], "user_mentions": [{ "screen_name": "twitterapi", "name": "Twitter API", "id": 6253282, "id_str": "6253282", "indices": [11, 22] }], "media": [{ "id": 411031503833792512, "id_str": "411031503833792512", "indices": [55, 78], "media_url": "https:\/\/ton.twitter.com\/1.1\/ton\/data\/dm\/411031503817039874\/411031503833792512\/cOkcq9FS.jpg", "media_url_https": "https:\/\/ton.twitter.com\/1.1\/ton\/data\/dm\/411031503817039874\/411031503833792512\/cOkcq9FS.jpg", "url": "https:\/\/t.co\/ZSvIEMOPb8", "display_url": "pic.twitter.com\/ZSvIEMOPb8", "expanded_url": "https:\/\/ton.twitter.com\/1.1\/ton\/data\/dm\/411031503817039874\/411031503833792512\/cOkcq9FS.jpg", "type": "photo", "sizes": { "medium": { "w": 600, "h": 450, "resize": "fit" }, "large": { "w": 1024, "h": 768, "resize": "fit" }, "thumb": { "w": 150, "h": 150, "resize": "crop" }, "small": { "w": 340, "h": 255, "resize": "fit" } } }] } };

	$scope.text = JSON.stringify($scope.data);

	$scope.$watch('text', function (text) {
		if (!text)
			return;
		try {
			$scope.data = JSON.parse(text);
			$scope.formatJSON();
		} catch (err) {
		}
	}, true);

	$scope.formatJSON = function () {
		let text = $scope.text.replace(/\n/g, ' ').replace(/\r/g, ' ');
		let t = [];
		let tab = 0;
		let inString = false;
		for (let i = 0, len = text.length; i < len; i++) {
			let c = text.charAt(i);
			if (inString && c === inString) {
				if (text.charAt(i - 1) !== '\\')
					inString = false;
			}
			else if (!inString && (c === '"' || c === "'"))
				inString = c;
			else if (!inString && (c === ' ' || c === "\t"))
				c = '';
			else if (!inString && c === ':')
				c += ' ';
			else if (!inString && c === ',')
				c += "\n" + getSpace(tab * 2);
			else if (!inString && (c === '[' || c === '{')) {
				tab++;
				c += "\n" + getSpace(tab * 2);
			}
			else if (!inString && (c === ']' || c === '}')) {
				tab--;
				c = "\n" + getSpace(tab * 2) + c;
			}
			t.push(c);
		}
		$scope.text = t.join('');
	};

	$scope.minifyJSON = function () {
		let text = $scope.text.replace(/\n/g, ' ').replace(/\r/g, ' ');
		let t = [];
		let inString = false;
		for (let i = 0, len = text.length; i < len; i++) {
			let c = text.charAt(i);
			if (inString && c === inString) {
				if (text.charAt(i - 1) !== '\\') {
					inString = false;
				}
			} else if (!inString && (c === '"' || c === "'")) {
				inString = c;
			} else if (!inString && (c === ' ' || c === "\t")) {
				c = '';
			}
			t.push(c);
		}
		$scope.text = t.join('');
	};

	$scope.formatJSON();
});