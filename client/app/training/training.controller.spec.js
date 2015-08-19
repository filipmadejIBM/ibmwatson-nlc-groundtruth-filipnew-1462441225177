/**
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict';

describe('Controller: TrainingCtrl', function() {

    // load the controller's module
    beforeEach(module('ibmwatson-nlc-groundtruth-app'));

    // Defer resolution of state transitions so we can test this in isolation
    beforeEach(module(function($urlRouterProvider) {
        $urlRouterProvider.deferIntercept();
    }));

    var TrainingCtrl, scope;
    var CLASSES, TEXTS;

    function resetClasses() {
        CLASSES = [{
            label: 'object1',
            edit: false,
            checked: false,
            selected: true,
            $$hashKey: 'ID',
            id: '0'
        }, {
            label: 'object2',
            edit: false,
            checked: true,
            selected: false,
            $$hashKey: 'ID',
            id: '1'
        }, {
            label: 'object3',
            edit: true,
            checked: false,
            selected: false,
            $$hashKey: 'ID',
            id: '2'
        }];
    }

    var OLD_CLASS = 'object1';
    var NEW_CLASS = 'object2';

    function resetTexts() {
        TEXTS = [{
            $$hashKey: 'ID',
            checked: true,
            beingTagged : false,
            classes: [OLD_CLASS]
        }, {
            $$hashKey: 'ID',
            checked: false,
            beingTagged : true,
            classes: [OLD_CLASS, 'object3']
        }, {
            $$hashKey: 'ID',
            checked: false,
            beingTagged : false,
            classes: ['object3']
        }];
    }


    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $compile, $rootScope, $q) {
        var nlcMock = {
            train: function() {
                console.log('train');
            },
            download: function() {
                console.log('download');
            },
            upload: function() {
                return $q(function(resolve){
                    resolve({
                        classes: ['class'],
                        text: [ {text: 'text', classes: ['class']} ]
                    });
                });
            }
        };

        var classesMock = {
            query: function() {
                return $q(function(resolve) {
                    resolve();
                });
            },
            post: function(params, callback) {
                callback(null, { id : '5' });
            },
            remove: function() {
                return $q(function(resolve) {
                    resolve();
                });
            },
            update: function() {
                return $q(function(resolve) {
                    resolve();
                });
            }
        };

        var textsMock = {
            query: function() {
                return $q(function(resolve) {
                    resolve();
                });
            },
            post: function(params, callback) {
                callback(null, { id : '5' });
            },
            addClasses: function() {
                return $q(function(resolve) {
                    resolve();
                });
            },
            removeClasses: function() {
                return $q(function(resolve) {
                    resolve();
                });
            },
            remove: function() {
                return $q(function(resolve) {
                    resolve();
                });
            },
            update: function() {
                return $q(function(resolve) {
                    resolve();
                });
            }
        };


        scope = $rootScope.$new();
        TrainingCtrl = $controller('TrainingCtrl', {
            $scope: scope,
            nlc: nlcMock,
            classes: classesMock,
            texts: textsMock
        });

        var html = '<div id="ID"></div>';
        var elm = angular.element(document.body).append(html);
        $compile(elm)($rootScope);
        resetClasses();
        resetTexts();
    }));

    it('should set the attribute \'checked\' to a given boolean for an array of objects', function() {
        expect(CLASSES[0].checked).toBeFalsy();
        expect(CLASSES[1].checked).toBeTruthy();
        expect(CLASSES[2].checked).toBeFalsy();

        scope.checkAll(CLASSES, true);

        expect(CLASSES[0].checked).toBeTruthy();
        expect(CLASSES[1].checked).toBeTruthy();
        expect(CLASSES[2].checked).toBeTruthy();

        scope.checkAll(CLASSES, false);

        expect(CLASSES[0].checked).toBeFalsy();
        expect(CLASSES[1].checked).toBeFalsy();
        expect(CLASSES[2].checked).toBeFalsy();
    });

    it('should return a set of \'checked\' objects from within an array', function() {
        var filteredArray = scope.getChecked(CLASSES);

        expect(filteredArray.length).toBe(1);
        expect(filteredArray[0]).toBe(CLASSES[1]);
    });

    it('should return a set of \'selected\' objects from within an array', function() {
        scope.classes = CLASSES;
        var filteredArray = scope.getSelectedClasses();

        expect(filteredArray.length).toBe(1);
        expect(filteredArray[0]).toBe(CLASSES[0]);
    });

    it('should set \'selected\' for a given object if not in edit mode', function() {
        scope.selectClass(CLASSES[2]);
        expect(CLASSES[2].selected).toBeFalsy();

        scope.selectClass(CLASSES[1]);
        expect(CLASSES[1].selected).toBeTruthy();
    });

    it('should set \'selected\' to false for a given object', function() {
        scope.removeClassFromView(CLASSES[2]);
        expect(CLASSES[2].selected).toBeFalsy();

        scope.removeClassFromView(CLASSES[1]);
        expect(CLASSES[1].selected).toBeFalsy();
    });

    it('should return a an object with a given \'label\' from within an array', function() {
        var obj = scope.getFromLabel(CLASSES, 'object1');
        expect(obj).toBe(CLASSES[0]);

        obj = scope.getFromLabel(CLASSES, 'objectX');
        expect(obj).toBeNull();
    });

    it('should allow the user to edit a field', function() {
        scope.editField(CLASSES[1]);
        expect(CLASSES[1].edit).toBeTruthy();

        // already in edit mode, so should now dismiss
        scope.editField(CLASSES[1]);
        expect(CLASSES[1].edit).toBeFalsy();
        expect(angular.element('#ID')[0].value).toBe(CLASSES[1].label);
    });

    it('should allow the user to edit a field', function() {
        var event = {
            keyCode: 27
        };
        scope.keyUpCancelEditing(CLASSES[2], event);
        expect(CLASSES[2].edit).toBeFalsy();
        expect(angular.element('#ID')[0].value).toBe(CLASSES[2].label);
    });

    it('should propogate a new class name to all texts', function() {

        scope.texts = TEXTS;

        scope.classLabelChanged(CLASSES[0], OLD_CLASS, NEW_CLASS);

        expect(scope.texts[0].classes[0]).toBe(NEW_CLASS);
        expect(scope.texts[1].classes[0]).toBe(NEW_CLASS);
        expect(scope.texts[2].classes[0]).toBe('object3');
    });

    it('should count the number of texts with a given class tagged', function() {
        scope.texts = TEXTS;

        var count = scope.numberTextsInClass({
            label: OLD_CLASS
        });

        expect(count).toBe(2);
    });

    it('should return an array of classes tagged for a given text', function() {
        scope.texts = TEXTS;
        scope.classes = CLASSES;
        var classes = scope.classesForText(TEXTS[0]);

        expect(classes).toEqual([CLASSES[0]]);
    });

    it('should provide a converter to input a <type> string and get back the consequent list of <type>\'s', function() {
        var array = [];

        scope.texts = TEXTS;
        array = scope.getScopeArray('text');
        expect(array).toEqual(scope.texts);

        scope.classes = CLASSES;
        array = scope.getScopeArray('class');
        expect(array).toEqual(scope.classes);
    });

    // TODO: Finish tests
    /*it('should be able to delete a list of texts from $scope.texts', function() {
        scope.texts = TEXTS;
        var deletedObj = TEXTS.splice(2);
        console.log(deletedObj);
        scope.deleteTexts([deletedObj]);
        console.log(scope.texts);
        expect(scope.texts).toEqual(TEXTS[0], TEXTS[1]);
    });*/



    // -------------------------------------------------------------------------------------------------
    //
    // --------------------- tagging (associating text with class or classes) ---------------------
    //
    // -------------------------------------------------------------------------------------------------

    it('should determine whether a given text has been tagged or not', function() {
        expect(scope.isTagged({classes:[]})).toBeFalsy();
        expect(scope.isTagged({classes:['class1', 'class2']})).toBeTruthy();
    });

    it('should toggle \'beingTagged\' attribute of an text', function() {
        scope.beginTaggingText(TEXTS[1]);
        expect(TEXTS[1].beingTagged).toBeFalsy();

        scope.beginTaggingText(TEXTS[0]);
        expect(TEXTS[0].beingTagged).toBeTruthy();
    });

    it('should be able to tag an text with any number of classes', function() {
        scope.tagTexts(TEXTS, [{label: 'newClass'}]);

        TEXTS.forEach(function(d) {
            expect(d.classes[d.classes.length - 1]).toBe('newClass');
        });
    });

    it('should be able to tag all checked texts with all checked classes', function() {
        scope.texts = TEXTS;
        scope.classes = CLASSES;

        expect(TEXTS[0].classes.length).toBe(1);
        scope.tagCheckedTexts();
        expect(TEXTS[0].classes.length).toBe(2);
    });

    // -------------------------------------------------------------------------------------------------
    //
    // ----------------------------------------- General functions -------------------------------------
    //
    // -------------------------------------------------------------------------------------------------

    it('should return a elements that do not match a given string', function() {
        var array =['class1', 'class2', 'class3'];
        var filteredArray = array.filter(scope.doesNotMatch('class1'));
        expect(filteredArray.length).toBe(2);
        expect(filteredArray[0]).toBe(array[1]);
        expect(filteredArray[1]).toBe(array[2]);
    });


    // -------------------------------------------------------------------------------------------------
    //
    // --------------------------------------- API/Service functions -----------------------------------
    //
    // -------------------------------------------------------------------------------------------------

    /*it('should be able to call the NLC \'train\' service', function() {
        scope.train();
    });*/

    it('should be able to call the NLC \'download\' service', function() {
        scope.exportToFile();
        // TODO: Test the response
    });

    // the test was failing due to "TypeError: 'undefined' is not a function (evaluating '$browser.cookies()')"
    // got rid of this error by changing version of angular mocks to 1.3.17
    // then found that the $rootScope.$digest() is triggering the authentication service, tried to mock it but failed.

    /*it('should be able to call the NLC \'upload\' service', inject(function($rootScope) {
        var fileContent = 'text,class';
        scope.importFile(fileContent);
        $rootScope.$digest();
        expect(scope.classes[0].label).toEqual('class');
        expect(scope.texts[0].label).toEqual('text');
        expect(scope.texts[0].classes).toEqual(['class']);
    }));*/

});
