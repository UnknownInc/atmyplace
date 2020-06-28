// Colors reference
// You can use the following as so:
// console.log(colorCode, data); };
// console.log(`${colorCode}some colorful text string${resetCode} rest of string in normal color`); };
// 
// ... and so on.

function color(message, colorName) {
  if (colorName) {
    return `${colorName}${message}\x1b[0m`;
  }
  return message;
}

export default class ColorCode {
  static reset (m) { return color(m,"\x1b[0m"); };
  static bright (m) { return color(m,"\x1b[1m"); };
  static dim (m) { return color(m,"\x1b[2m"); };
  static underscore (m) { return color(m,"\x1b[4m"); };
  static blink (m) { return color(m,"\x1b[5m"); };
  static reverse (m) { return color(m,"\x1b[7m"); };
  static hidden (m) { return color(m,"\x1b[8m"); };

  static black (m) { return color(m,"\x1b[30m"); };
  static red (m) { return color(m,"\x1b[31m"); };
  static green (m) { return color(m,"\x1b[32m"); };
  static yellow (m) { return color(m,"\x1b[33m"); };
  static blue (m) { return color(m,"\x1b[34m"); };
  static magenta (m) { return color(m,"\x1b[35m"); };
  static cyan (m) { return color(m,"\x1b[36m"); };
  static white (m) { return color(m,"\x1b[37m"); };

  static BGblack (m) { return color(m,"\x1b[40m"); };
  static BGred (m) { return color(m,"\x1b[41m"); };
  static BGgreen (m) { return color(m,"\x1b[42m"); };
  static BGyellow (m) { return color(m,"\x1b[43m"); };
  static BGblue (m) { return color(m,"\x1b[44m"); };
  static BGmagenta (m) { return color(m,"\x1b[45m"); };
  static BGcyan (m) { return color(m,"\x1b[46m"); };
  static BGwhite (m) { return color(m,"\x1b[47m"); };
};