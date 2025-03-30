export const shuffleArray = (array:Array<any>) => {
   for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
   }

   return array;
}

export const convertNumberToCharacter = (num:number) => {
   return num
      .toString()    // convert number to string
      .split('')     // convert string to array of characters
      .map(Number)   // parse characters as numbers
      .map(n => (n || 10) + 64)   // convert to char code, correcting for J
      .map(c => String.fromCharCode(c))   // convert char codes to strings
      .join('');     // join values together
}
