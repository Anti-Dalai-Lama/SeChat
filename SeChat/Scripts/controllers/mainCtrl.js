sechat.controller('mainCtrl', function ($scope, $http, $q, sechatApi, $state, $stateParams) {

    $scope.name;

    

    //region RSA
    $scope.pRSA;
    $scope.qRSA;
    $scope.nRSA;
    $scope.eilerRSA;
    $scope.eRSA;
    $scope.dRSA;


    $scope.arrayForFerma = [2,3,5,7,11,13,17,19,23,29,31,37,41,
                            43,47,53,59,61,67,71,73,79,83,89,
                            97,101,103,107,109,113,127,131,137,
                            139,149,151,157,163,167,173,179,181,
                            191,193,197,199,211,223,227,229,233,
                            239,241,251,257];


    $scope.getRandomBigInteger = function (min, max) { //генерация случ. большого числа для Диффи-Хеллмана
        return Math.floor(Math.random() * (max - min)) + min;
    };

    $scope.getRandomOddInteger = function (min, max) {
        var n = $scope.getRandomBigInteger(min, max);
        while (n % 2 == 0) {
            n = $scope.getRandomBigInteger(min, max);
        }
        return n;
    };

    $scope.getRandomIntegerArray = function (count, number) {
        var array = [];
        for (var i = 0; i < count; i++) {
            array.push($scope.getRandomBigInteger(2, number))
        }
        return array;
    }

    $scope.countPowByModule = function (number, pow, module) { //возведение в степень по модулю
        var result = 1;
        number = number % module;
        while (pow > 2) {
            if (pow % 2 == 0) {
                number = (number * number) % module;
                pow = pow / 2;
            }
            else {
                result = (result * number) % module;
                pow -= 1;
            }
        }
        number = Math.pow(number, pow) % module;
        result = (result * number) % module;
        return result;
    };

    $scope.testFerma = function (number) { //простота числа
        for (var i = 0; i < $scope.arrayForFerma.length; i++) {
            if (number % $scope.arrayForFerma[i] == 0) {
                return false;
            }
        }
        var array = $scope.getRandomIntegerArray(259, number);
        for (var i = 0; i < array.length; i++) {
            if (array[i] % number != 0) {
                if ($scope.countPowByModule(array[i], number - 1, number) != 1) {
                    return false;
                }
            }
        }
        return true;
    };

    $scope.getRandomBigSimple = function (min, max) { //генерация случ. простого числа для RSA
        var numberToCheck = $scope.getRandomBigInteger(min, max);
        while (!$scope.testFerma(numberToCheck)) {
            numberToCheck = $scope.getRandomBigInteger(min, max);
        }
        return numberToCheck;
    };

    $scope.getNPartRSA = function () { //генерация N для RSA
        $scope.pRSA = $scope.getRandomBigSimple(1000, 0x2FFF);
        $scope.qRSA = $scope.getRandomBigSimple(1000, 0x2FFF);
        $scope.nRSA = $scope.pRSA*$scope.qRSA;
        return $scope.nRSA;
    };

    $scope.getEilerPartRSA = function () { //генерация N для RSA
        $scope.eilerRSA = ($scope.pRSA-1) * ($scope.qRSA-1);
        return $scope.eilerRSA;
    };

    $scope.gcd = function (a, b) {//НОД
        if (!b) {
            return a;
        }
        return $scope.gcd(b, a % b);
    };

    $scope.getDPartRSA = function () { //генерация N для RSA
        var d = $scope.getRandomOddInteger(2, 0x4FFFFFF);//??
        while ($scope.gcd($scope.eilerRSA, d) != 1) {
            d = $scope.getRandomOddInteger(2, 0x4FFFFFF);
        }
        $scope.dRSA = d;
        return d;
    };

    $scope.extendedEuclid = function (a, b) {//a < b
        var d = 0;
        var x1 = 0;
        var x2 = 1;
        var y1 = 1;
        var phi = b;
        var temp1;
        var temp2;
        var x;
        var y;
        while (a > 0) {
            temp1 = Math.floor(phi / a);//floor
            temp2 = phi - temp1 * a;
            phi = a;
            a = temp2;

            x = x2 - temp1 * x1;
            y = d - temp1 * y1;

            x2 = x1;
            x1 = x;
            d = y1;
            y1 = y;
        }
        return d;
    };

    $scope.numberMod = function (number, module) {
        if (number >= 0) {
            return number % module;
        }
        else {
            while (number < (-module)) {
                number += module;
            }
            if (number >= 0) {
                return number % module;
            }
            else {
                return module + number;
            }
        }
    };

    $scope.getEPartRSA = function () {
        var number = $scope.extendedEuclid($scope.dRSA, $scope.eilerRSA);
        $scope.eRSA = $scope.numberMod(number, $scope.eilerRSA);
        return $scope.eRSA;
    };

    $scope.initializeRSA = function () { //генерация N для RSA
        var res = $scope.generateRSA();
        while (!res) {
            res = $scope.generateRSA();
        }
    };

    $scope.generateRSA = function () {
        $scope.getNPartRSA();
        $scope.getEilerPartRSA();
        $scope.getDPartRSA();
        $scope.getEPartRSA();
        var mes = $scope.getRandomBigInteger(4, $scope.nRSA);
        var c = $scope.countPowByModule(mes, $scope.dRSA, $scope.nRSA);
        var v = $scope.countPowByModule(c, $scope.eRSA, $scope.nRSA);
        if (v == mes) {
            return true;
        }
        else {
            return false;
        }
    };
    //endregion RSA

    //region DES

    function BitArray(numbersArray) {//2 числа 32-битных
        this.parts = numbersArray;
    }

    BitArray.prototype.initializeFromText = function (text) {//text 4 символа
        var left = text.charCodeAt(0).toString(16);
        var leftbuf = text.charCodeAt(1).toString(16);
        while(leftbuf.length != 4){
            leftbuf = "0" + leftbuf;
        }
        left = left + leftbuf;
        left = parseInt(left, 16);

        var right = text.charCodeAt(2).toString(16);
        var rightbuf = text.charCodeAt(3).toString(16);
        while (rightbuf.length != 4) {
            rightbuf = "0" + rightbuf;
        }
        right = right + rightbuf;
        right = parseInt(right, 16);

        this.parts = [left, right];
    }

    BitArray.prototype.printHex = function () {//text 4 символа
        var left = this.parts[0].toString(16);
        var right = this.parts[1].toString(16);
        while (left.length != 8) {
            left = "0" + left;
        }
        while (right.length != 8) {
            right = "0" + right;
        }

        var left1 = left.substr(0, 4);
        var left2 = left.substr(4, 7);
        var right1 = right.substr(0, 4);
        var right2 = right.substr(4, 7);
        

        return String.fromCharCode(parseInt(left1, 16)) + String.fromCharCode(parseInt(left2, 16)) + String.fromCharCode(parseInt(right1, 16)) + String.fromCharCode(parseInt(right2, 16));
    }

    BitArray.prototype.printBinary = function () {//text 4 символа
        var left = this.parts[0].toString(2);
        var right = this.parts[1].toString(2);
        while (left.length != 32) {
            left = "0" + left;
        }
        while (right.length != 32) {
            right = "0" + right;
        }

        var left1 = left.substr(0, 16);
        var left2 = left.substr(16, 16);
        var right1 = right.substr(0, 16);
        var right2 = right.substr(16, 16);

        console.log(left1 + " " + left2 + " " + right1 + " " + right2);
    }

    BitArray.prototype.getBit = function (position) {//1-64
        var res = 0;
        if (position < 33) {
            var left = this.parts[0].toString(2);
            while (left.length != 32) {
                left = "0" + left;
            }
            res = parseInt(left.charAt(position - 1), 2);
        }
        if (position > 32 && position < 65) {
            var right = this.parts[1].toString(2);
            while (right.length != 32) {
                right = "0" + right;
            }
            res = parseInt(right.charAt(position - 33), 2);
        }
        return res;
    }

    $scope.initialTranspositonMatrix = [58, 50, 42, 34, 26, 18, 10, 2,
                                        60, 52, 44, 36, 28, 20, 12, 4,
                                        62, 54, 46, 38, 30, 22, 14, 6,
                                        64, 56, 48, 40, 32, 24, 16, 8,
                                        57, 49, 41, 33, 25, 17, 9, 1,
                                        59, 51, 43, 35, 27, 19, 11, 3,
                                        61, 53, 45, 37, 29, 21, 13, 5,
                                        63, 55, 47, 39, 31, 23, 15, 7];

    $scope.reverseTranspositonMatrix = [40, 8, 48, 16, 56, 24, 64, 32,
                                        39, 7, 47, 15, 55, 23, 63, 31,
                                        38, 6, 46, 14, 54, 22, 62, 30,
                                        37, 5, 45, 13, 53, 21, 61, 29,
                                        36, 4, 44, 12, 52, 20, 60, 28,
                                        35, 3, 43, 11, 51, 19, 59, 27,
                                        34, 2, 42, 10, 50, 18, 58, 26,
                                        33, 1, 41, 9, 49, 17, 57, 25];

    BitArray.prototype.transpose = function (array) {//[64]
        var left;
        var right;
        var buf = this.getBit(array[0]).toString();
        for (var i = 2; i < 33; i++) {
            buf = buf + this.getBit(array[i - 1]).toString();
        }
        left = parseInt(buf, 2);
        buf = this.getBit(array[32]).toString();
        for (var i = 34; i < 65; i++) {
            buf = buf + this.getBit(array[i - 1]).toString();
        }
        right = parseInt(buf, 2);
        this.parts = [left, right];
    };

    $scope.xor = function (part1, part2) {
        part1 = part1.toString(2);
        part2 = part2.toString(2);
        while (part1.length != 32) {
            part1 = "0" + part1;
        }
        while (part2.length != 32) {
            part2 = "0" + part2;
        }
        //console.log(part1);
        //console.log(part2);

        var bigpart1 = [part1.substr(0, 16), part1.substr(16, 16)];
        var bigpart2 = [part2.substr(0, 16), part2.substr(16, 16)];

        var res = [];
        res.push((parseInt(bigpart1[0], 2) ^ parseInt(bigpart2[0], 2)).toString(2));
        res.push((parseInt(bigpart1[1], 2) ^ parseInt(bigpart2[1], 2)).toString(2));
        while (res[1].length != 16) {
            res[1] = "0" + res[1];
        }
        while (res[0].length != 16) {
            res[0] = "0" + res[0];
        }
        //console.log(res[0] + res[1]);
        return parseInt(res[0] + res[1],2);
    };

    $scope.xor48 = function (part1, part2) {
        part1 = part1.toString(2);
        part2 = part2.toString(2);
        while (part1.length != 48) {
            part1 = "0" + part1;
        }
        while (part2.length != 48) {
            part2 = "0" + part2;
        }

        //console.log("part1: " + part1);
        //console.log("part2: " + part2);

        var bigpart1 = [part1.substr(0, 24), part1.substr(24, 24)];
        var bigpart2 = [part2.substr(0, 24), part2.substr(24, 24)];

        var res = [];
        res.push((parseInt(bigpart1[0], 2) ^ parseInt(bigpart2[0], 2)).toString(2));
        res.push((parseInt(bigpart1[1], 2) ^ parseInt(bigpart2[1], 2)).toString(2));
        while (res[1].length != 24) {
            res[1] = "0" + res[1];
        }
        while (res[0].length != 24) {
            res[0] = "0" + res[0];
        }
        //console.log("resul: " + res[0] + res[1]);
        return parseInt(res[0] + res[1], 2);
    };

    $scope.expand32BitNumberTo48BitArray = function (number) {//взять по 16 битов и xor их, а затем конкатенация!
        
        //console.log("Expansion param:");
        //console.log(number.toString(16));

        number = number.toString(2);

        while (number.length != 32) {
            number = "0" + number;
        }
        var left = "";
        var right = "";
        var array = [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17,
                     16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];
        for (var i = 0; i < array.length; i++) {
            if (i < 16) {
                left = left + number.charAt(array[i] - 1);
            }
            else {
                right = right + number.charAt(array[i] - 1);
            }
        }
        //console.log("Expansion:");
        //console.log(parseInt(left + right, 2).toString(16));
        return parseInt(left + right, 2);
    };

    $scope.s1Array = [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
                      [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
                      [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
                      [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]];

    $scope.s2Array = [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
                      [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
                      [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
                      [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]];

    $scope.s3Array = [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
                      [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
                      [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
                      [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]];

    $scope.s4Array = [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
                      [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
                      [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
                      [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]];

    $scope.s5Array = [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
                      [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
                      [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
                      [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]];

    $scope.s6Array = [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
                      [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
                      [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
                      [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]];

    $scope.s7Array = [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
                      [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
                      [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
                      [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]];

    $scope.s8Array = [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
                      [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
                      [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
                      [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]];

    $scope.sArray = [$scope.s1Array, $scope.s2Array, $scope.s3Array, $scope.s4Array, $scope.s5Array, $scope.s6Array, $scope.s7Array, $scope.s8Array]

    $scope.sTransformation = function (number) {//48
        //console.log("S-Transformation param:");
        //console.log(number.toString(2));
        number = number.toString(2);
        while (number.length != 48) {
            number = "0" + number;
        }
        var res = "";
        var buf;
        for (var i = 0; i < number.length; i += 6) {
            //console.log(number[i] + number[i + 5]);
            //console.log(number[i + 1] + number[i + 2] + number[i + 3] + number[i + 4]);
            buf = ($scope.sArray[Math.floor(i / 6)][parseInt(number[i] + number[i + 5], 2)][parseInt(number[i + 1] + number[i + 2] + number[i + 3] + number[i + 4], 2)]).toString(2);
            while (buf.length != 4) {
                buf = "0" + buf;
            }
            res += buf;
        }
        //console.log("S-Transformation:");
        //console.log("res: " + res);
        //console.log(parseInt(res, 2).toString(16));
        return res;//32 string
    }

    $scope.pTransposition = function (number) {//32 string
        //console.log("P-Transposition param:");
        //console.log(parseInt(number, 2).toString(16));
        var res = "";
        var array = [16,7,20,21,29,12,28,17,
                     1,15,23,26,5,18,31,10,
                     2,8,24,14,32,27,3,9,
                     19,13,30,6,22,11,4,25];
        for (var i = 0; i < array.length; i++) {
            res += number.charAt(array[i]-1);
        }
        //console.log("P-Transposition:");
        //console.log(parseInt(res, 2).toString(16));
        return parseInt(res, 2);
    }

    $scope.f = function (right, key) {
        var buf = $scope.xor48($scope.expand32BitNumberTo48BitArray(right), key);
        //console.log("buf: " + buf.toString(2));
        return $scope.pTransposition($scope.sTransformation(buf));
    }

    $scope.gPreparationKey = function (number) {//16 hex string
        var first = parseInt(number.substr(0, 8), 16).toString(2);
        var second = parseInt(number.substr(8, 8), 16).toString(2);
        while (first.length != 32) {
            first = "0" + first;
        }
        while (second.length != 32) {
            second = "0" + second;
        }
        number = first + second;

        var res = "";
        //VerifyControlBits
        for (var i = 0; i < 57; i += 8) {
            var sum = 0;
            for (var k = 0; k <= 6; k++) {
                sum += parseInt(number.charAt(i + k),2);
            }
            if (sum % 2 == 1) {
                number = number.replaceAt(i + 7, "0");
            }
            else {
                number = number.replaceAt(i + 7, "1");
            }
        }
        var array = [57, 49, 41, 33, 25, 17, 9,
                     1, 58, 50, 42, 34, 26, 18,
                     10, 2, 59, 51, 43, 35, 27,
                     19, 11, 3, 60, 52, 44, 36,
                     63, 55, 47, 39, 31, 23, 15,
                     7, 62, 54, 46, 38, 30, 22,
                     14, 6, 61, 53, 45, 37, 29,
                     21, 13, 5, 28, 20, 12, 4];
        for (var i = 0; i < array.length; i++) {
            res += number.charAt(array[i] - 1);
        }
        //console.log(parseInt(res.substr(0, 24),2).toString(16) + parseInt(res.substr(24),2).toString(16));
        return res;//56 string
    }

    $scope.shiftKeyArray = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
    $scope.keyArray = [];

    $scope.hKeyTransposition = function (number) {//56 string
        var res = "";
        var array = [14, 17, 11, 24, 1, 5,
                     3, 28, 15, 6, 21, 10,
                     23, 19, 12, 4, 26, 8,
                     16, 7, 27, 20, 13, 2,
                     41, 52, 31, 37, 47, 55,
                     30, 40, 51, 45, 33, 48,
                     44, 49, 39, 56, 34, 53,
                     46, 42, 50, 36, 29, 32];
        for (var i = 0; i < array.length; i++) {
            res += number.charAt(array[i] - 1);
        }
        return parseInt(res, 2);//48 int
    }

    $scope.keysInitiation = function (number) {//56 string
        $scope.keyArray = [];
        var left = number.substr(0, 28);
        var right = number.substr(28, 28);
        for (var i = 0; i < 16; i++) {
            left = left.substr($scope.shiftKeyArray[i]) + left.substr(0, $scope.shiftKeyArray[i]);
            right = right.substr($scope.shiftKeyArray[i]) + right.substr(0, $scope.shiftKeyArray[i]);
            //console.log("round key: " + parseInt(left, 2).toString(16) + parseInt(right, 2).toString(16));
            $scope.keyArray.push($scope.hKeyTransposition(left + right));
        }
    }

    String.prototype.replaceAt = function (index, character) {
        return this.substr(0, index) + character + this.substr(index + character.length);
    }

    $scope.encryptDES = function (message, key) {//пока принимает hex запись 16 символов
        var x = new BitArray([0, 0]);
        x.initializeFromText(message);
        x.transpose($scope.initialTranspositonMatrix);
        key = $scope.gPreparationKey(key);
        $scope.keysInitiation(key);
        var left;
        for (var i = 1; i < 16; i++) {
            left = x.parts[1]; //L = R
            x.parts[1] = $scope.xor(x.parts[0], $scope.f(x.parts[1], $scope.keyArray[i - 1]));
            x.parts[0] = left;
        }
        left = x.parts[1]; //L = R
        x.parts[0] = $scope.xor(x.parts[0], $scope.f(x.parts[1], $scope.keyArray[15]));
        x.parts[1] = left;

        x.transpose($scope.reverseTranspositonMatrix);
        return x.printHex();
    }

    $scope.decryptDES = function (message, key) {//пока принимает hex запись 16 символов
        var x = new BitArray([0, 0]);
        x.initializeFromText(message);
        x.transpose($scope.initialTranspositonMatrix);
        key = $scope.gPreparationKey(key);
        $scope.keysInitiation(key);
        var left;
        for (var i = 16; i > 1; i--) {
            left = x.parts[1]; //L = R
            x.parts[1] = $scope.xor(x.parts[0], $scope.f(x.parts[1], $scope.keyArray[i - 1]));
            x.parts[0] = left;
        }
        left = x.parts[1]; //L = R
        x.parts[0] = $scope.xor(x.parts[0], $scope.f(x.parts[1], $scope.keyArray[0]));
        x.parts[1] = left;

        x.transpose($scope.reverseTranspositonMatrix);
        return x.printHex();
    }

    $scope.rawEncryptDES = function (message, key) {
        while (message.length % 4 != 0) {
            message += " ";
        }
        var res = "";
        for (var i = 0; i < Math.floor(message.length / 4) ; i++) {
            res += $scope.encryptDES(message.substr(i * 4, 4), key);
        }
        return res;
    }

    $scope.rawDecryptDES = function (message, key) {
        var res = "";
        for (var i = 0; i < Math.floor(message.length / 4) ; i++) {
            res += $scope.decryptDES(message.substr(i * 4, 4), key);
        }
        return res;
    }


    //endredion DES

    //region MD5

    $scope.alignBits = function (text, size) {
        if (text.length < size) {
            while (text.length != size) {
                text = "0" + text;
            }
        }
        else {
            while (text.length != size) {
                text = text.substr(1);
            }
        }
        return text;
    }

    $scope.alignMessageStream = function (message) {//сообщение полное
        var result = "";
        for (var i = 0; i < message.length; i++){
            result += $scope.alignBits(message.charCodeAt(i).toString(16), 4);
        }
        //получили строку из hex символов
        result += "8";
        var countzeroes = (result.length * 4) % 512;
        if (countzeroes < 448) {
            countzeroes = (448 - countzeroes) / 4;
        }
        else {
            countzeroes = (448 + 512 - countzeroes) / 4;
        }
        for (var i = 0; i < countzeroes; i++) {
            result += "0";
        }
        var startedsize = (message.length * 16).toString(16); //размер начального сообщения в битах
        startedsize = $scope.alignBits(startedsize, 16);
        return result + startedsize;
    }

    function BufferDH(part1, part2) {//2 числа 16-битных (part1 = )
        this.parts = [part1, part2];
    }

    BufferDH.prototype.createByHex = function (hex1, hex2) {//text по 2 hex (hex1 = FFFF, hex2 = FFFF)
        this.parts = [parseInt(hex1, 16), parseInt(hex2, 16)];
    }

    BufferDH.prototype.get32BitInt = function () {
        return parseInt(this.parts[0].toString(2) + $scope.alignBits(this.parts[1].toString(2),16), 2);
    }

    BufferDH.prototype.printHex = function () {
        console.log($scope.alignBits(this.parts[0].toString(16), 4) + " " + $scope.alignBits(this.parts[1].toString(16), 4));
    }

    BufferDH.prototype.printBin = function () {
        console.log($scope.alignBits(this.parts[0].toString(2), 16) + " " + $scope.alignBits(this.parts[1].toString(2), 16));
    }

    $scope.ADH;
    $scope.BDH;
    $scope.CDH;
    $scope.DDH;

    $scope.AADH;
    $scope.BBDH;
    $scope.CCDH;
    $scope.DDDH;

    $scope.initializeBuffers = function () {
        $scope.ADH = new BufferDH(0, 0);
        $scope.ADH.createByHex("0123","4567");
        $scope.BDH = new BufferDH(0, 0);
        $scope.BDH.createByHex("89AB", "CDEF");
        $scope.CDH = new BufferDH(0, 0);
        $scope.CDH.createByHex("FEDC", "BA98");
        $scope.DDH = new BufferDH(0, 0);
        $scope.DDH.createByHex("7654", "3210");
    }

    $scope.saveBuffers = function () {
        $scope.AADH = $scope.ADH;
        $scope.BBDH = $scope.BDH;
        $scope.CCDH = $scope.CDH;
        $scope.DDDH = $scope.DDH;
    }

    $scope.xorDH = function (a, b) {//32-bit xor
        var res = new BufferDH(a.parts[0] ^ b.parts[0], a.parts[1] ^ b.parts[1]);
        return res;
    }

    $scope.andDH = function (a, b) {//32-bit xor
        var res = new BufferDH(a.parts[0] & b.parts[0], a.parts[1] & b.parts[1]);
        return res;
    }

    $scope.orDH = function (a, b) {//32-bit xor
        var res = new BufferDH(a.parts[0] | b.parts[0], a.parts[1] | b.parts[1]);
        return res;
    }

    $scope.notDH = function (a) {//32-bit xor
        //a.printBin();
        var res = new BufferDH(0,0);
        var left = $scope.alignBits(a.parts[0].toString(2), 16);
        for (var i = 0; i < 16; i++) {
            if (left.charAt(i) == '0') {
                left += "1";
            } else {
                left += "0";
            }
        }
        left = left.substr(16);
        var right = $scope.alignBits(a.parts[1].toString(2), 16);
        for (var i = 0; i < 16; i++) {
            if (right.charAt(i) == '0') {
                right += "1";
            } else {
                right += "0";
            }
        }
        right = right.substr(16);
        res.createByHex(parseInt(left, 2).toString(16), parseInt(right, 2).toString(16));
        //res.printBin();
        return res;
    }

    $scope.funFDH = function (x, y, z) {
        return $scope.orDH($scope.andDH(x, y), $scope.andDH($scope.notDH(x), z));
    }

    $scope.funGDH = function (x, y, z) {
        return $scope.orDH($scope.andDH(x, z), $scope.andDH($scope.notDH(z), y));
    }

    $scope.funHDH = function (x, y, z) {
        return $scope.xorDH($scope.xorDH(x,y),z);
    }

    $scope.funIDH = function (x, y, z) {
        return $scope.xorDH(y, $scope.orDH($scope.notDH(z),x));
    }

    $scope.tTable = [];

    $scope.initializeTTable = function () {
        $scope.tTable = [];
        for (var i = 0; i < 65; i++) {
            $scope.tTable.push(Math.floor(Math.pow(2,32) * Math.abs(Math.sin(i))));
        }
    }

    $scope.xTable = [];

    $scope.circleLeftShift = function (number, s) {//BufferDH 32 bit
        var n = $scope.alignBits(number.parts[0].toString(2), 16) + $scope.alignBits(number.parts[1].toString(2), 16);
        var b = n.substr(s) + n.substr(0, s);
        return new BufferDH(parseInt(b.substr(0, 16), 2), parseInt(b.substr(16, 16), 2));
    }

    $scope.addBuffer = function (a, b) {//2 32 bit buffers
        var res2 = "";
        //a.printBin();
        //b.printBin();
        var a2 = $scope.alignBits(a.parts[1].toString(2), 16).split("").reverse().join("");
        var b2 = $scope.alignBits(b.parts[1].toString(2), 16).split("").reverse().join("");

        var a1 = $scope.alignBits(a.parts[0].toString(2), 16).split("").reverse().join("");
        var b1 = $scope.alignBits(b.parts[0].toString(2), 16).split("").reverse().join("");
        var buf = 0;
        for (var i = 0; i < 16; i++) {
            if (a2[i] == "0" && b2[i] == "0") {
                if (buf == 0) {
                    res2 += "0";
                } else {
                    res2 += "1";
                    buf = 0;
                }
            } else if ((a2[i] == "1" && b2[i] == "0") || (a2[i] == "0" && b2[i] == "1")) {
                if (buf == 0) {
                    res2 += "1";
                } else {
                    res2 += "0";
                    buf = 1;
                }
            } else if (a2[i] == "1" && b2[i] == "1") {
                if (buf == 0) {
                    res2 += "0";
                    buf = 1;
                } else {
                    res2 += "1";
                    buf = 1;
                }
            }
        }
        for (var i = 0; i < 16; i++) {
            if (a1[i] == "0" && b1[i] == "0") {
                if (buf == 0) {
                    res2 += "0";
                } else {
                    res2 += "1";
                    buf = 0;
                }
            } else if ((a1[i] == "1" && b1[i] == "0") || (a1[i] == "0" && b1[i] == "1")) {
                if (buf == 0) {
                    res2 += "1";
                } else {
                    res2 += "0";
                    buf = 1;
                }
            } else if (a1[i] == "1" && b1[i] == "1") {
                if (buf == 0) {
                    res2 += "0";
                    buf = 1;
                } else {
                    res2 += "1";
                    buf = 1;
                }
            }
        }

        res2 = res2.split("").reverse().join("");
        return new BufferDH(parseInt(res2.substr(0, 16), 2), parseInt(res2.substr(16, 16), 2));

    }

    $scope.roundDH = function (a, b, c, d, k, s, i, fun) {//ABCD 
        var func;
        switch (fun) {
            case "F":
                func = $scope.funFDH(b, c, d);
                break;
            case "G":
                func = $scope.funGDH(b, c, d);
                break;
            case "H":
                func = $scope.funHDH(b, c, d);
                break;
            case "I":
                func = $scope.funIDH(b, c, d);
                break;
            default:
                console.log("crit in func");
        }
        func = $scope.addBuffer(func, a);
        func = $scope.addBuffer(func, $scope.xTable[k]);
        var t = $scope.alignBits($scope.tTable[i].toString(16),8);
        func = $scope.addBuffer(func, new BufferDH(parseInt(t.substr(0, 4), 16), parseInt(t.substr(4, 4), 16)));
        func = $scope.addBuffer($scope.circleLeftShift(func, s), b);
        return func;
    }

    $scope.hashMD5 = function (message) {
        message = $scope.alignMessageStream(message);
        //console.log(message);
        $scope.initializeTTable();
        $scope.initializeBuffers();
        var currentText;
        for (var i = 0; i < message.length; i += (512 / 4)) {
            $scope.saveBuffers();
            $scope.xTable = [];
            for (var k = 0; k < 16; k++) {
                $scope.xTable.push(new BufferDH(parseInt(message.substr(8 * k + i, 4),16), parseInt(message.substr(8 * k + 4 + i, 4),16)));
            }
            //console.log("ROUND " + i.toString());
            //for (var k = 0; k < $scope.xTable.length; k++) {
            //    $scope.xTable[k].printHex();
            //}
            for (var n = 0; n < 4; n++) {
                $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 4 * n, 7, 4 * n + 1, "F");
                $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 4 * n + 1, 12, 4 * n + 2, "F");
                $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 4 * n + 2, 17, 4 * n + 3, "F");
                $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 4 * n + 3, 22, 4 * n + 4, "F");
            }

            for (var n = 0; n < 4; n++) {
                $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 4 * n + 1, 5, 4 * (n + 4) + 1, "G");
                if (n == 0) {
                    $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 6, 9, 18, "G");
                    $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 11, 14, 19, "G");
                    $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 0, 20, 20, "G");
                } else if (n ==1) {
                    $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 10, 9, 22, "G");
                    $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 15, 14, 23, "G");
                    $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 4, 20, 24, "G");
                } else if (n == 2) {
                    $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 14, 9, 26, "G");
                    $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 3, 14, 27, "G");
                    $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 8, 20, 28, "G");
                } else if (n == 3) {
                    $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 2, 9, 30, "G");
                    $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 7, 14, 31, "G");
                    $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 12, 20, 32, "G");
                }
                
            }

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 5, 4, 33, "H");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 8, 11, 34, "H");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 11, 16, 35, "H");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 14, 23, 36, "H");

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 1, 4, 37, "H");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 4, 11, 38, "H");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 7, 16, 39, "H");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 10, 23, 40, "H");

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 13, 4, 41, "H");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 0, 11, 42, "H");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 3, 16, 43, "H");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 6, 23, 44, "H");

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 9, 4, 45, "H");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 12, 11, 46, "H");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 15, 16, 47, "H");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 2, 23, 48, "H");

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 0, 6, 49, "I");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 7, 10, 50, "I");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 14, 15, 51, "I");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 5, 21, 52, "I");

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 12, 6, 53, "I");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 3, 10, 54, "I");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 10, 15, 55, "I");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 1, 21, 56, "I");

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 8, 6, 57, "I");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 15, 10, 58, "I");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 6, 15, 59, "I");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 13, 21, 60, "I");

            $scope.ADH = $scope.roundDH($scope.ADH, $scope.BDH, $scope.CDH, $scope.DDH, 4, 6, 61, "I");
            $scope.DDH = $scope.roundDH($scope.DDH, $scope.ADH, $scope.BDH, $scope.CDH, 11, 10, 62, "I");
            $scope.CDH = $scope.roundDH($scope.CDH, $scope.DDH, $scope.ADH, $scope.BDH, 2, 15, 63, "I");
            $scope.BDH = $scope.roundDH($scope.BDH, $scope.CDH, $scope.DDH, $scope.ADH, 9, 21, 64, "I");

            $scope.ADH = $scope.addBuffer($scope.AADH, $scope.ADH);
            $scope.BDH = $scope.addBuffer($scope.BBDH, $scope.BDH);
            $scope.CDH = $scope.addBuffer($scope.CCDH, $scope.CDH);
            $scope.DDH = $scope.addBuffer($scope.DDDH, $scope.DDH);
        }

        var p1 = $scope.alignBits($scope.ADH.parts[0].toString(16), 4) + $scope.alignBits($scope.ADH.parts[1].toString(16), 4);
        var p2 = $scope.alignBits($scope.BDH.parts[0].toString(16), 4) + $scope.alignBits($scope.BDH.parts[1].toString(16), 4);
        var p3 = $scope.alignBits($scope.CDH.parts[0].toString(16), 4) + $scope.alignBits($scope.CDH.parts[1].toString(16), 4);
        var p4 = $scope.alignBits($scope.DDH.parts[0].toString(16), 4) + $scope.alignBits($scope.DDH.parts[1].toString(16), 4);

        //console.log(p1 + p2 + p3 + p4);

        return p1 + p2 + p3 + p4;

    }


    //endregion MD5

    //Diffi-Hellman

    $scope.secretKey;
    $scope.openKey;
    $scope.pHellman;
    $scope.gHellman;
    $scope.keyHellman;

    $scope.checkGNumber = function () {
        var buf;
        let done = new Set();
        for (var i = 0; i < $scope.pHellman - 1; i++) {
            buf = $scope.countPowByModule($scope.gHellman, i, $scope.pHellman);
            if (!done.has(buf)) {
                done.add(buf);
            } else {
                return false;
            }
        }
        return true;
    }

    $scope.getGHellman = function () {
        $scope.gHellman = $scope.getRandomBigSimple(1000, $scope.pHellman);
        while (!$scope.checkGNumber()) {
            $scope.gHellman = $scope.getRandomBigSimple(1000, $scope.pHellman);
        }
        return $scope.gHellman;
    }

    $scope.partnerSKey;
    $scope.partnerOpenKey;
    $scope.partnerKey;

    $scope.getPartnerKey = function () {
        $scope.partnerSKey = $scope.getRandomBigInteger(1000, 0x2FFF);//SIZE MATTERS
        $scope.partnerOpenKey = $scope.countPowByModule($scope.gHellman, $scope.partnerSKey, $scope.pHellman);
    }

    $scope.formPartnerKey = function () {
        $scope.partnerKey = $scope.countPowByModule($scope.openKey, $scope.partnerSKey, $scope.pHellman);
    }

    $scope.initializeDiffiHellman = function () {
        $scope.secretKey = $scope.getRandomBigInteger(1000, 0x2FFF);//SIZE MATTERS
        $scope.openKey = $scope.countPowByModule($scope.gHellman, $scope.secretKey, $scope.pHellman);
    }

    $scope.extedKeyTo64Bit = function (number) {//hex string
        number = $scope.alignBits(parseInt(number,16).toString(2), 16); //4 hex symb
        var n1 = number.substr(1) + number.substr(0, 1);
        var n3 = number.substr(5) + number.substr(0, 5);
        var n2 = number.split("").reverse().join("");
        return parseInt(n1, 2).toString(16) + parseInt(n2, 2).toString(16) + parseInt(n3, 2).toString(16) + parseInt(number, 2).toString(16);
    }

    $scope.generatePGHellman = function () {
        $scope.pHellman = $scope.getRandomBigSimple(1000, 0x2FFF);
        $scope.getGHellman();
    }


    $scope.sendGetPG = function (p, g, e, n) {
        var deferred = $q.defer();
        var param, method;
        method = '/Crypto/FormPG';
        param = { p: p, g: g , e: e, n: n};
        $http.get(method, { params: param }).then(function successCallback(response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    }

    $scope.sendOpenKeyDH = function () {
        var deferred = $q.defer();
        var param, method;
        method = '/Crypto/SetOpenKey';
        param = { openkey: $scope.openKey };
        $http.get(method, { params: param }).then(function successCallback(response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    }

    $scope.partnerRSAKey = [];//E - 0, N - 1
    $scope.myDialogId;

    $scope.initiateDialog = function () {
        $scope.initializeRSA();
        $scope.keyHellman = 0;
        //$scope.nRSA $scope.dRSA $scope.eRSA
        //отправить (E,N)
        $scope.generatePGHellman(); //generate p and g then send them
        $scope.sendGetPG($scope.pHellman, $scope.gHellman, $scope.eRSA, $scope.nRSA).then(function (result) {
            if (result == "done") {//если подключаемся первыми
                $scope.myDialogId = 1;
                console.log("initiating dialog");
                console.log("Diffi-Hellman: p = " + $scope.pHellman);
                console.log("Diffi-Hellman: g = " + $scope.gHellman);
                $scope.initializeDiffiHellman();
                console.log("Diffi-Hellman: secret = " + $scope.secretKey);
                console.log("Diffi-Hellman: open = " + $scope.openKey);
                $scope.sendOpenKeyDH().then(function (partnerOpenKey) {
                    if (partnerOpenKey == "none") {
                        console.log("$scope.sendOpenKeyDH CRIT!");
                        location.reload();
                    }
                    $scope.keyHellman = $scope.countPowByModule(parseInt(partnerOpenKey.split(" ")[0],10), $scope.secretKey, $scope.pHellman);
                    $scope.keyHellman = $scope.extedKeyTo64Bit($scope.keyHellman.toString(16));
                    console.log("Extended Hellman Key: " + $scope.keyHellman);
                    $scope.partnerRSAKey = [parseInt(partnerOpenKey.split(" ")[1], 10), parseInt(partnerOpenKey.split(" ")[2], 10)];
                });
            }
            else { //если подключаемся вторыми
                console.log("connecting to the dialog");
                $scope.myDialogId = 2;
                $scope.pHellman = parseInt(result.split(" ")[0],10);
                $scope.gHellman = parseInt(result.split(" ")[1], 10);
                console.log("Diffi-Hellman: p = " + $scope.pHellman);
                console.log("Diffi-Hellman: g = " + $scope.gHellman);
                $scope.initializeDiffiHellman();
                console.log("Diffi-Hellman: secret = " + $scope.secretKey);
                console.log("Diffi-Hellman: open = " + $scope.openKey);
                $scope.sendOpenKeyDH().then(function (partnerOpenKey) {
                    if (partnerOpenKey == "none") {
                        console.log("$scope.sendOpenKeyDH CRIT!");
                        location.reload();
                    }
                    $scope.keyHellman = $scope.countPowByModule(parseInt(partnerOpenKey.split(" ")[0], 10), $scope.secretKey, $scope.pHellman);
                    $scope.keyHellman = $scope.extedKeyTo64Bit($scope.keyHellman.toString(16));
                    console.log("Extended Hellman Key: " + $scope.keyHellman);
                    $scope.partnerRSAKey = [parseInt(partnerOpenKey.split(" ")[1], 10), parseInt(partnerOpenKey.split(" ")[2], 10)];
                });
            }
        });
    }

    $scope.isEmptyText = function (text) {
        var len = text.length;
        if (len == 0) {
            return true;
        }
        else {
            for (var i = 0; i < len; i++){
                if (text[i] == " ") {
                    len--;
                }
            }
            if (len == 0) {
                return true;
            }
        }
        return false;
    }

    document.getElementById("myText").addEventListener("keypress", function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            $scope.sendMessage();
        }
    });

    $scope.sendMessageToServer = function (text, sign) {
        var deferred = $q.defer();
        var param, method;
        method = '/Crypto/SendMessage';
        param = { id: $scope.myDialogId, mes: text, sign: sign }; //crit!
        $http.get(method, { params: param }).then(function successCallback(response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    }

    $scope.getMessageFromServer = function () {//сколько сообщений от другого пользователя уже есть
        var deferred = $q.defer();
        var param, method;
        method = '/Crypto/GetMessage';
        param = { id: $scope.myDialogId };
        $http.get(method, { params: param }).then(function successCallback(response) {
            deferred.resolve(response.data);
        });
        return deferred.promise;
    }

    $scope.gettingMessages = function () {
        if ($scope.keyHellman != 0) {
            $scope.getMessageFromServer().then(function (result) {
                if (result != "none") {
                    if ($scope.partnermessages.length != result.length) {
                        for (var i = $scope.partnermessages.length; i < result.length; i++) {
                            result[i].mes = $scope.decodeFromHexText(result[i].mes);
                            var text = $scope.rawDecryptDES(result[i].mes, $scope.keyHellman);
                            var m1 = $scope.countPowByModule(result[i].sign, $scope.partnerRSAKey[0], $scope.partnerRSAKey[1]);
                            var mbuf = $scope.hashMD5(result[i].mes);
                            var m2 = parseInt(mbuf[3] + mbuf[18] + mbuf[24] + mbuf[11], 16);
                            console.log("sign = " + result[i].sign);
                            //console.log("m1 = " + m1.toString());
                            //console.log("m2 = " + m2.toString());
                            if (m1 == m2) {
                                console.log("message is TRUE!");
                            }
                            else {
                                console.log("message is FALSE!");
                            }
                            $scope.partnermessages.push({ id: result[i].id, message: text, color: "#BBDEFB" });
                            if ($scope.allmessages.length > 10) {
                                $scope.allmessages.splice(0, 1);
                            }
                            $scope.allmessages.push({ id: result[i].id, message: text, color: "#BBDEFB" });
                        }
                    }
                } else {
                    console.log("getting mes: none");
                }
            });
        }
    }

    $scope.encodeToHexText = function (text) {
        var result = "";
        for (var i = 0; i < text.length; i++) {
            result += $scope.alignBits(text.charCodeAt(i).toString(16), 4);
        }
        return result;
    }

    $scope.decodeFromHexText = function (text) {
        var result = "";
        for (var i = 0; i < text.length; i += 4) {
            result += String.fromCharCode(parseInt(text[i] + text[i + 1] + text[i + 2] + text[i + 3], 16))
        }
        return result;
    }

    $scope.sendMessage = function () {
        var t = $scope.isEmptyText(document.getElementById("myText").value);
        var initialtext = document.getElementById("myText").value;
        var text = document.getElementById("myText").value;
        if (!t) {
            text = $scope.rawEncryptDES(text, $scope.keyHellman);//encrypt message
            console.log("DES(" + initialtext + ") = " + text);
            var hash = $scope.hashMD5(text);//128 bits in hex
            console.log("HASH = " + hash);
            var sign = $scope.countPowByModule(parseInt(hash[3] + hash[18] + hash[24] + hash[11], 16), $scope.dRSA, $scope.nRSA);
            console.log("SIGN = " + sign);
            text = $scope.encodeToHexText(text);
            $scope.sendMessageToServer(text, sign).then(function (result) {
                if (result == "done") {
                    if ($scope.allmessages.length > 10) {
                        $scope.allmessages.splice(0, 1);
                    }
                    $scope.allmessages.push({ id: $scope.myDialogId, message: initialtext, color: "#FFF" });
                }
            });
        }
        document.getElementById("myText").value = "";
    }

    $scope.initiateDialog();

    setInterval(function () {
        $scope.gettingMessages();
    }, 1000);
    
    
    $scope.allmessages = [];
    $scope.partnermessages = [];

});