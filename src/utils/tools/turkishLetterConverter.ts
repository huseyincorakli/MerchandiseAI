export const turkishToEnglish = (text: string): string => {
     const charMap = {
         'ı': 'i',
         'i': 'i',
         'ğ': 'g',
         'Ğ': 'G',
         'ü': 'u',
         'Ü': 'U',
         'ş': 's',
         'Ş': 'S',
         'ö': 'o',
         'Ö': 'O',
         'ç': 'c',
         'Ç': 'C',
         'İ': 'I'
     };
 
     return text.replace(
         /[ıiğĞüÜşŞöÖçÇİ]/g,
         char => charMap[char as keyof typeof charMap]
     );
 };