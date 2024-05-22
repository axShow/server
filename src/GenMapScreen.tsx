import {
    Box, Button, Checkbox, FormControlLabel,
    Grid,
    Slider, TextField, Typography
} from "@mui/material";
import {
    Unstable_NumberInput as NumberInput,
    numberInputClasses,
} from '@mui/base/Unstable_NumberInput';
import {FC, useEffect, useState} from "react";
import {styled} from '@mui/system';
import {CopterData} from "./App.tsx";
// @ts-ignore
// import AR from 'js-aruco'; // Assuming js-aruco2 is installed
var AR = {
    DICTIONARIES: {},
    codes: {},
    codeList: [],
    tau: 0,


    Dictionary: (dicName: string) => {dicName},
    _initialize: (dicName: string) => {dicName},
};
// this.AR = AR;
AR.DICTIONARIES = {

}
// @ts-ignore
AR.DICTIONARIES['ARUCO_4X4_1000'] = {
    nBits: 16,
    tau: 3,
    codeList: [[181, 50], [15, 154], [51, 45], [153, 70], [84, 158], [121, 205], [158, 46], [196, 242], [254, 218], [207, 86], [249, 145], [17, 167], [14, 183], [42, 15], [36, 177], [38, 62], [70, 101], [102, 0], [108, 94], [118, 175], [134, 139], [176, 43], [204, 213], [221, 130], [254, 71], [148, 113], [172, 228], [165, 84], [33, 35], [52, 111], [68, 21], [87, 178], [158, 207], [240, 203], [8, 174], [9, 41], [24, 117], [4, 255], [13, 246], [28, 90], [23, 24], [42, 40], [50, 140], [56, 178], [36, 232], [46, 235], [45, 63], [75, 100], [80, 46], [80, 19], [81, 148], [85, 104], [93, 65], [95, 151], [104, 1], [104, 103], [97, 36], [97, 233], [107, 18], [111, 229], [103, 223], [126, 27], [128, 160], [131, 68], [139, 162], [147, 122], [132, 108], [133, 42], [133, 156], [156, 137], [159, 161], [187, 124], [188, 4], [182, 91], [191, 200], [183, 171], [202, 31], [201, 98], [217, 88], [211, 213], [204, 152], [199, 160], [197, 55], [233, 93], [249, 37], [251, 187], [238, 42], [247, 77], [53, 117], [138, 173], [118, 23], [10, 207], [6, 75], [45, 193], [73, 216], [67, 244], [79, 54], [79, 211], [105, 228], [112, 199], [122, 110], [180, 234], [237, 79], [252, 231], [254, 166], [0, 37], [0, 67], [10, 136], [10, 134], [2, 111], [0, 28], [0, 151], [8, 55], [10, 49], [9, 198], [11, 1], [9, 251], [11, 88], [16, 130], [24, 45], [16, 120], [16, 115], [18, 116], [18, 177], [26, 249], [19, 6], [12, 14], [12, 241], [4, 51], [12, 159], [14, 242], [14, 253], [7, 76], [15, 164], [7, 47], [5, 181], [15, 145], [7, 219], [30, 228], [20, 57], [29, 128], [21, 200], [31, 139], [21, 186], [29, 177], [32, 128], [40, 233], [34, 162], [40, 83], [42, 240], [34, 247], [41, 64], [33, 70], [41, 185], [43, 156], [43, 178], [56, 202], [56, 46], [48, 7], [56, 231], [58, 73], [58, 101], [50, 93], [59, 136], [57, 29], [59, 211], [38, 71], [39, 128], [47, 170], [45, 20], [37, 222], [37, 83], [47, 119], [52, 72], [60, 168], [60, 65], [52, 13], [52, 251], [54, 154], [61, 224], [53, 106], [61, 9], [61, 237], [63, 196], [63, 108], [55, 206], [61, 92], [61, 118], [55, 176], [63, 23], [63, 255], [72, 229], [66, 104], [74, 45], [65, 96], [73, 81], [65, 221], [75, 223], [88, 79], [90, 72], [88, 22], [80, 93], [90, 250], [90, 181], [81, 35], [91, 138], [89, 25], [81, 53], [76, 105], [70, 193], [78, 11], [68, 95], [78, 89], [77, 131], [77, 125], [71, 216], [71, 115], [92, 133], [94, 68], [86, 43], [92, 187], [85, 195], [95, 110], [95, 235], [93, 18], [85, 94], [98, 112], [98, 21], [97, 194], [107, 32], [99, 69], [107, 92], [107, 91], [120, 12], [122, 207], [120, 127], [121, 128], [113, 229], [113, 116], [121, 182], [113, 211], [123, 51], [100, 106], [102, 168], [110, 167], [110, 145], [101, 34], [109, 203], [103, 141], [109, 49], [126, 128], [126, 226], [126, 141], [116, 210], [124, 50], [126, 53], [117, 171], [119, 5], [127, 43], [125, 218], [127, 146], [128, 117], [128, 243], [129, 166], [137, 237], [129, 252], [152, 166], [154, 32], [145, 67], [153, 249], [145, 147], [155, 212], [132, 9], [132, 107], [134, 196], [142, 100], [134, 26], [133, 78], [141, 203], [133, 103], [133, 175], [133, 215], [135, 179], [156, 225], [156, 242], [148, 23], [149, 0], [149, 162], [157, 35], [159, 98], [157, 82], [149, 218], [160, 197], [170, 205], [162, 216], [162, 87], [169, 61], [169, 87], [171, 82], [163, 54], [163, 89], [176, 244], [184, 18], [176, 191], [178, 157], [187, 237], [185, 114], [185, 150], [164, 195], [172, 210], [174, 177], [165, 130], [175, 101], [165, 123], [175, 250], [180, 100], [188, 98], [180, 129], [182, 160], [190, 238], [190, 13], [188, 217], [190, 248], [181, 40], [183, 9], [183, 210], [192, 234], [192, 25], [192, 253], [200, 211], [202, 90], [193, 77], [201, 180], [193, 87], [195, 152], [195, 29], [216, 128], [216, 239], [218, 43], [208, 30], [209, 5], [211, 173], [219, 167], [196, 201], [204, 120], [205, 69], [197, 11], [207, 207], [220, 172], [212, 2], [220, 99], [212, 39], [212, 245], [214, 120], [222, 184], [221, 230], [213, 93], [221, 189], [223, 29], [226, 202], [234, 107], [224, 180], [226, 56], [226, 212], [227, 34], [225, 216], [240, 3], [242, 204], [248, 246], [241, 73], [243, 234], [241, 156], [249, 245], [241, 59], [236, 141], [238, 201], [230, 15], [228, 247], [231, 96], [239, 232], [237, 178], [229, 21], [239, 209], [244, 134], [252, 1], [246, 195], [244, 124], [252, 147], [245, 66], [253, 152], [245, 61], [2, 189], [0, 225], [2, 226], [2, 174], [8, 120], [0, 116], [8, 158], [8, 209], [8, 125], [10, 50], [10, 222], [2, 81], [1, 162], [3, 128], [11, 131], [11, 75], [11, 39], [11, 239], [9, 182], [9, 89], [9, 147], [11, 248], [3, 217], [3, 241], [16, 196], [24, 171], [26, 160], [26, 4], [26, 108], [26, 174], [18, 137], [16, 23], [26, 243], [25, 64], [17, 2], [17, 43], [17, 207], [27, 34], [19, 46], [17, 21], [19, 187], [12, 32], [12, 201], [12, 220], [12, 54], [6, 20], [6, 114], [13, 97], [5, 13], [13, 143], [15, 224], [15, 73], [7, 133], [5, 144], [13, 51], [15, 150], [15, 118], [20, 96], [28, 141], [20, 218], [28, 115], [30, 148], [30, 186], [22, 217], [30, 61], [22, 251], [29, 233], [29, 254], [31, 159], [40, 139], [32, 175], [34, 14], [34, 169], [42, 141], [42, 163], [42, 239], [40, 144], [40, 59], [42, 88], [34, 51], [33, 160], [33, 2], [33, 165], [33, 199], [43, 3], [35, 103], [41, 48], [41, 210], [43, 25], [43, 155], [43, 151], [56, 40], [56, 165], [58, 134], [50, 1], [56, 159], [50, 210], [58, 153], [58, 213], [57, 232], [59, 193], [51, 67], [59, 231], [49, 154], [51, 144], [59, 158], [36, 196], [44, 74], [44, 173], [44, 207], [44, 103], [38, 234], [46, 229], [44, 112], [46, 18], [46, 209], [46, 57], [37, 100], [37, 231], [47, 204], [45, 188], [45, 113], [37, 213], [37, 155], [39, 16], [47, 124], [39, 242], [39, 58], [47, 182], [39, 211], [47, 179], [39, 31], [60, 75], [54, 192], [54, 238], [62, 233], [52, 184], [60, 20], [60, 82], [52, 114], [52, 126], [52, 191], [62, 113], [62, 83], [61, 140], [53, 162], [53, 46], [53, 45], [55, 172], [53, 112], [55, 250], [63, 241], [63, 219], [72, 196], [72, 233], [74, 194], [74, 65], [66, 235], [72, 19], [74, 216], [66, 253], [74, 23], [73, 99], [67, 110], [65, 58], [73, 177], [65, 61], [75, 146], [75, 155], [67, 63], [88, 34], [80, 170], [88, 39], [82, 200], [82, 132], [82, 10], [90, 15], [88, 152], [88, 92], [80, 219], [80, 247], [90, 244], [81, 236], [81, 66], [81, 13], [91, 3], [83, 235], [81, 118], [89, 113], [81, 147], [83, 249], [91, 179], [83, 151], [76, 76], [68, 75], [76, 35], [70, 140], [78, 39], [70, 144], [78, 212], [69, 206], [69, 229], [69, 39], [79, 193], [71, 5], [69, 52], [69, 114], [92, 200], [92, 14], [84, 235], [86, 137], [86, 67], [94, 231], [92, 112], [84, 178], [94, 121], [86, 243], [93, 163], [93, 242], [85, 29], [93, 157], [87, 252], [87, 210], [95, 115], [104, 45], [104, 195], [104, 135], [106, 74], [98, 105], [96, 185], [104, 255], [106, 220], [106, 218], [106, 62], [106, 81], [106, 49], [98, 215], [97, 204], [107, 130], [107, 227], [105, 58], [97, 158], [97, 149], [97, 117], [105, 95], [105, 55], [99, 218], [112, 2], [120, 99], [112, 79], [114, 202], [122, 173], [112, 123], [122, 20], [122, 249], [122, 211], [122, 187], [121, 226], [113, 41], [123, 103], [113, 208], [121, 57], [115, 48], [115, 185], [115, 83], [115, 255], [108, 136], [100, 9], [108, 67], [102, 6], [102, 131], [100, 176], [100, 218], [110, 159], [103, 200], [111, 238], [109, 59], [111, 210], [116, 128], [124, 171], [126, 104], [126, 2], [124, 156], [116, 54], [124, 17], [126, 222], [126, 182], [118, 219], [125, 196], [125, 138], [117, 109], [119, 136], [119, 32], [119, 65], [117, 56], [117, 190], [125, 155], [119, 87], [136, 40], [128, 172], [136, 13], [136, 103], [130, 78], [138, 161], [130, 43], [128, 24], [136, 249], [128, 157], [138, 156], [130, 49], [138, 117], [130, 151], [129, 9], [129, 235], [129, 7], [139, 40], [139, 172], [131, 46], [131, 229], [129, 80], [137, 50], [139, 122], [139, 150], [131, 125], [144, 135], [154, 252], [146, 245], [145, 170], [147, 65], [147, 37], [155, 235], [153, 52], [145, 247], [155, 218], [147, 86], [132, 66], [140, 129], [140, 79], [134, 72], [134, 166], [142, 3], [134, 227], [134, 111], [142, 175], [132, 94], [132, 119], [134, 250], [142, 30], [142, 55], [135, 10], [143, 138], [143, 38], [135, 33], [135, 13], [133, 114], [135, 62], [156, 67], [158, 97], [148, 88], [148, 248], [156, 50], [148, 118], [148, 177], [148, 221], [148, 155], [156, 219], [158, 156], [158, 210], [150, 25], [158, 177], [149, 105], [159, 109], [151, 43], [149, 182], [149, 185], [157, 61], [157, 87], [168, 236], [168, 37], [162, 172], [162, 2], [170, 102], [170, 143], [170, 231], [168, 48], [168, 122], [168, 246], [168, 147], [162, 20], [170, 52], [162, 114], [170, 242], [162, 241], [161, 64], [169, 10], [161, 38], [169, 197], [169, 207], [161, 52], [169, 18], [161, 250], [171, 152], [163, 247], [176, 6], [176, 69], [184, 141], [178, 132], [184, 240], [184, 85], [178, 118], [186, 145], [178, 113], [185, 192], [185, 66], [185, 42], [179, 140], [179, 202], [187, 102], [179, 15], [177, 218], [187, 20], [187, 246], [179, 19], [164, 104], [172, 44], [172, 161], [172, 235], [172, 199], [164, 103], [166, 192], [174, 224], [166, 35], [173, 232], [165, 204], [167, 236], [173, 124], [165, 26], [165, 145], [173, 25], [165, 151], [180, 109], [190, 203], [188, 58], [188, 245], [190, 189], [190, 243], [181, 37], [181, 143], [183, 104], [191, 228], [189, 254], [189, 157], [181, 245], [181, 243], [191, 176], [183, 90], [191, 62], [183, 57], [191, 213], [183, 29], [191, 53], [183, 127], [200, 1], [192, 165], [194, 130], [200, 189], [194, 252], [202, 145], [194, 91], [201, 68], [193, 42], [195, 192], [201, 122], [193, 185], [201, 117], [193, 247], [203, 177], [208, 108], [216, 135], [208, 175], [218, 196], [210, 12], [218, 9], [208, 48], [216, 148], [208, 58], [208, 182], [208, 117], [210, 118], [218, 93], [218, 53], [210, 23], [217, 2], [211, 232], [211, 229], [209, 154], [209, 246], [209, 81], [219, 20], [211, 62], [211, 211], [196, 96], [204, 167], [198, 66], [198, 71], [206, 231], [196, 92], [204, 29], [204, 53], [198, 188], [205, 168], [197, 12], [197, 228], [197, 194], [205, 45], [205, 89], [205, 149], [197, 147], [199, 95], [212, 197], [222, 136], [214, 36], [222, 236], [214, 226], [222, 198], [222, 35], [220, 220], [220, 26], [212, 17], [222, 84], [214, 148], [222, 157], [221, 129], [213, 165], [215, 172], [215, 102], [223, 169], [213, 220], [221, 31], [223, 240], [226, 72], [226, 232], [226, 7], [224, 93], [234, 245], [235, 38], [235, 237], [225, 82], [225, 126], [233, 219], [248, 6], [240, 238], [248, 161], [250, 0], [250, 194], [240, 155], [250, 244], [250, 60], [242, 252], [242, 189], [242, 147], [241, 96], [249, 236], [241, 70], [249, 225], [243, 72], [243, 174], [243, 193], [243, 139], [243, 167], [241, 115], [241, 151], [243, 244], [251, 50], [228, 7], [230, 77], [236, 85], [237, 192], [237, 133], [239, 162], [231, 78], [229, 213], [239, 80], [244, 34], [244, 137], [244, 41], [246, 106], [254, 11], [254, 111], [244, 149], [244, 53], [244, 31], [246, 176], [245, 232], [245, 197], [253, 35], [255, 192], [247, 204], [247, 233], [245, 188], [253, 246], [245, 217], [253, 151], [253, 63], [255, 156], [255, 90], [247, 254], [255, 17], [247, 191]]
};
// @ts-ignore
AR.Dictionary = function (dicName: string) {
  this.codes = {};
  this.codeList = [];
  this.tau = 0;
  this._initialize(dicName);
};
AR.Dictionary.prototype._hex2bin = function (hex: any, nBits: any) {
  return hex.toString(2).padStart(nBits, '0');
};

AR.Dictionary.prototype._bytes2bin = function (byteList: any, nBits: any) {
  var bits = '', byte;
  for (byte of byteList) {
    bits += byte.toString(2).padStart(bits.length + 8 > nBits?nBits - bits.length:8, '0');
  }
  return bits;
};
// @ts-ignore
AR.Dictionary.prototype._initialize = function (dicName: string) {
  this.codes = {};
  this.codeList = [];
  this.tau = 0;
  this.nBits = 0;
  this.markSize = 0;
  this.dicName = dicName;
  // @ts-ignore
    var dictionary = AR.DICTIONARIES[dicName];
  if (!dictionary)
    throw 'The dictionary "' + dicName + '" is not recognized.';

  this.nBits = dictionary.nBits;
  this.markSize = Math.sqrt(dictionary.nBits) + 2;
  for (var i = 0; i < dictionary.codeList.length; i++) {
    var code = null;
    if (typeof dictionary.codeList[i] === 'number')
      code = this._hex2bin(dictionary.codeList[i], dictionary.nBits);
    if (typeof dictionary.codeList[i] === 'string')
      code = this._hex2bin(parseInt(dictionary.codeList[i], 16), dictionary.nBits);
    if (Array.isArray(dictionary.codeList[i]))
      code = this._bytes2bin(dictionary.codeList[i], dictionary.nBits);
    if (code === null)
      throw 'Invalid code ' + i + ' in dictionary ' + dicName + ': ' + JSON.stringify(dictionary.codeList[i]);
    if (code.length != dictionary.nBits)
      throw 'The code ' + i + ' in dictionary ' + dicName + ' is not ' +  dictionary.nBits + ' bits long but ' + code.length + ': ' + code;
    this.codeList.push(code);
    this.codes[code] = {
      id: i
    };
  }
  this.tau = dictionary.tau || this._calculateTau();
};
// @ts-ignore
AR.Dictionary.prototype.generateSVGForPrint = function (id: number) {
    var code = this.codeList[id];
    if (code == null)
        throw 'The id "' + id + '" is not valid for the dictionary "' + this.dicName + '". ID must be between 0 and ' + (this.codeList.length - 1) + ' included.';
    var size = this.markSize - 2;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (size + 2) + ' ' + (size + 2) + '">';
    //svg += '<rect x="0" y="0" width="' + (size+4) + '" height="' + (size+4) + '"  class="unprintable"  fill="white"/>';
    svg += '<rect x="0" y="0" width="' + (size + 2) + '" height="' + (size + 2) + '" fill="black"/>';
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            if (code[y * size + x] == '1')
                svg += '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="1" height="1" fill="white"/>';
        }
    }
    svg += '</svg>';
    return svg;
};
AR.Dictionary.prototype.generateSVG = function (id: number) {
  var code = this.codeList[id];
  if (code == null)
    throw 'The id "' + id + '" is not valid for the dictionary "' + this.dicName + '". ID must be between 0 and ' + (this.codeList.length-1) + ' included.';
  var size = this.markSize - 2;
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+ (size+4) + ' ' + (size+4) + '">';
  svg += '<rect x="0" y="0" width="' + (size+4) + '" height="' + (size+4) + '" fill="white"/>';
  svg += '<rect x="1" y="1" width="' + (size+2) + '" height="' + (size+2) + '" fill="black"/>';
  for(var y=0;y<size;y++) {
    for(var x=0;x<size;x++) {
      if (code[y*size+x]=='1')
        svg += '<rect x="' + (x+2) + '" y="' + (y+2) + '" width="1" height="1" fill="white"/>';
    }
  }
  svg += '</svg>';
  return svg;
};
interface GenMapScreenProp {
    selected: string[];
    copters: CopterData[];
}

export default function GenMapScreen(props: GenMapScreenProp) {
    props;
    const [arucoCodes, setArucoCodes] = useState<number[][]>([]);
    const [xNum, setXNum] = useState<number>(2);
    const [yNum, setYNum] = useState<number>(2);
    const [startId, setStartId] = useState<number>(0);
    const [length, setLength] = useState<number>(0.15);
    const [xDistance, setXDistance] = useState<number>(0.5);
    const [yDistance, setYDistance] = useState<number>(0.5);
    const [bottomLeft, setBottomLeft] = useState<boolean>(false);
    const [printEn, setPrint] = useState<boolean>(false);
    useEffect(() => {
        const generateArucoCodesCorner = (startCorner: 'topLeft' | 'bottomLeft' = 'topLeft') => {
            const codes: number[][] = [];
            let startY = 0;
            let startX = 0;
            let yIncrement = 1;
            let xIncrement = 1;
            switch (startCorner) {
                case 'topLeft':
                    startY = 0;
                    startX = 0;
                    yIncrement = 1;
                    xIncrement = 1;
                    break;
                case 'bottomLeft':
                    startY = yNum - 1;
                    startX = 0//xNum - 1;
                    yIncrement = -1;
                    xIncrement = 1;
                    break;
                default:
                    console.error(`Invalid startCorner: ${startCorner}. Using 'topLeft' as default.`);
                    startY = 0;
                    startX = 0;
                    yIncrement = 1;
                    xIncrement = 1;
            }

            for (let y = startY; (y >= 0 && y < yNum); y += yIncrement) {
                codes.push([]);
                for (let x = startX; (x >= 0 && x < xNum); x += xIncrement) {
                    const id = startId + (y * xNum) + x;
                    codes[codes.length - 1].push(id);
                }
            }

            setArucoCodes(codes);
        };

        generateArucoCodesCorner(bottomLeft ? "bottomLeft" : "topLeft");
    }, [startId, xNum, yNum, bottomLeft]); // Re-generate on prop changes


    return (
        <>
            <Box sx={{margin: 3}} className={"hidden-print"}>
                <Grid container spacing={2}> {/* Adjust spacing as needed */}
                    {arucoCodes.map((row, rowIndex) => (
                        <Grid container item key={rowIndex} spacing={2} display="flex" justifyContent="center"
                              alignItems="center"> {/* Adjust xs for columns */}
                            {row.map((cellValue, cellIndex) => (
                                <Grid xs={1} item key={cellIndex}>
                                    <ArucoMarkerElement markerId={cellValue}/>
                                </Grid>
                            ))}
                        </Grid>
                    ))}
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography id="x-slider" marginTop={2}>
                            On X:
                        </Typography>
                        <Slider value={xNum} max={12} min={1}
                                valueLabelDisplay="auto"
                                aria-labelledby={"x-slider"}
                                onChange={(_e, newValue) => setXNum(newValue as number)}/>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography id="y-slider" marginTop={2}>
                            On Y:
                        </Typography>
                        <Slider value={yNum} max={12} min={1}
                                valueLabelDisplay="auto"
                                aria-labelledby={"y-slider"}
                                onChange={(_e, newValue) => setYNum(newValue as number)}/>
                    </Grid>
                </Grid>
                <Typography id={"custom-label"} marginTop={2} marginBottom={1}>
                    Custom settings:
                </Typography>
                <Grid container spacing={2} paddingLeft={2} paddingRight={2}>
                    <Grid item xs={3}>
                        <Typography id={"marker-id"} marginTop={0}>
                            First marker id:
                        </Typography>
                        <NumberInput
                            slots={{
                                root: StyledInputRoot,
                                input: StyledInputElement,
                                incrementButton: StyledButton,
                                decrementButton: StyledButton,
                            }}
                            aria-labelledby={"marker-id"}
                            placeholder="Type a number…"
                            slotProps={{
                                incrementButton: {
                                    children: '▴',
                                },
                                decrementButton: {
                                    children: '▾',
                                },
                            }}
                            value={startId} min={0} max={999} onChange={(_e, val) => {
                            setStartId(val as number)
                        }}/>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography id={"marker-size"} marginTop={0}>
                            Marker size:
                        </Typography>
                        <TextField value={length} onChange={(e) => setLength(parseFloat(e.target.value))} fullWidth
                                   type={"number"}/>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography id={"marker-size"} marginTop={0}>
                            X distance:
                        </Typography>
                        <TextField value={xDistance} onChange={(e) => setXDistance(parseFloat(e.target.value))}
                                   fullWidth type={"number"}/>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography id={"marker-size"} marginTop={0}>
                            Y distance:
                        </Typography>
                        <TextField value={yDistance} onChange={(e) => setYDistance(parseFloat(e.target.value))}
                                   fullWidth type={"number"}/>
                    </Grid>
                </Grid>
                <Typography id={"other-label"} marginTop={2}>
                    Other:
                </Typography>
                <FormControlLabel
                    sx={{marginLeft: 2}}
                    control={
                        <Checkbox value={bottomLeft} onChange={(_e, val) => {
                            setBottomLeft(val)
                        }}/>
                    }
                    label={"Bottom left"}
                />

                <Typography id={"other-label"} marginTop={2}>
                    Deploy:
                </Typography>
                <Button sx={{marginLeft: 3}}>
                    Send to selected copters ({props.selected.length})
                </Button>
                <Button sx={{marginLeft: 3}}>
                    Send to all copters ({props.copters.length})
                </Button>
                <Button sx={{marginLeft: 3}} onClick={() => {
                    setPrint(true);
                    setTimeout(function () {
                        print();
                        setPrint(false);
                    }, 500);
                }}>
                    Print
                </Button>
                <Box height={40}/>
            </Box>
            <div className={"only-print"}>
                {printEn && arucoCodes.map((row, rowIndex) =>
                    row.map((cellValue, cellIndex) => (
                            <div>
                                <ArucoMarkerPrint key={`${rowIndex}-${cellIndex}`} markerId={cellValue}/>
                                <p style={{textAlign: "center"}}>id: {cellValue}</p>
                            </div>
                        )
                    ))}
            </div>
        </>

    );
};

interface ArucoMarkerProps {
    dictionary?: string;
    markerId: number;
}

const ArucoMarkerElement: FC<ArucoMarkerProps> = ({dictionary = "ARUCO_4X4_1000", markerId}) => {
    // @ts-ignore
    var dict = new AR.Dictionary(dictionary);
    var svg = dict.generateSVG(markerId);
    return (
        <div dangerouslySetInnerHTML={{__html: svg}}/>
    );
}
const ArucoMarkerPrint: FC<ArucoMarkerProps> = ({dictionary = "ARUCO_4X4_1000", markerId}) => {
    // @ts-ignore
    var dict = new AR.Dictionary(dictionary);
    var svg = dict.generateSVGForPrint(markerId);
    return (
        <div dangerouslySetInnerHTML={{__html: svg}}/>
    );
}
const blue = {
    100: '#DAECFF',
    200: '#80BFFF',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const StyledInputRoot = styled('div')(
    ({theme}) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400;
  border-radius: 8px;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
  box-shadow: 0px 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  display: grid;
  grid-template-columns: 1fr 19px;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  column-gap: 8px;
  padding: 8px;

  &.${numberInputClasses.focused} {
    border-color: ${blue[400]};
    box-shadow: 0 0 0 1px ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
  }

  &:hover {
    border-color: ${blue[400]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);

const StyledInputElement = styled('input')(
    ({theme}) => `
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.5;
  grid-column: 1/2;
  grid-row: 1/3;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  background: inherit;
  border: none;
  border-radius: inherit;
  padding: 8px 12px;
  outline: 0;
`,
);

const StyledButton = styled('button')(
    ({theme}) => `
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  appearance: none;
  padding: 0;
  width: 19px;
  height: 19px;
  font-family: system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1;
  box-sizing: border-box;
  background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
  border: 0;
  color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 120ms;

  &:hover {
    background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
    border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    cursor: pointer;
  }

  &.${numberInputClasses.incrementButton} {
    grid-column: 2/3;
    grid-row: 1/2;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: 1px solid;
    border-bottom: 0;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }

  &.${numberInputClasses.decrementButton} {
    grid-column: 2/3;
    grid-row: 2/3;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border: 1px solid;
    &:hover {
      cursor: pointer;
      background: ${blue[400]};
      color: ${grey[50]};
    }

  border-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[200]};
  background: ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};
  color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
  }
  & .arrow {
    transform: translateY(-1px);
  }
`,
);