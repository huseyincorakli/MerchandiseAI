export function mapCategoryToSortType(category: string): string | undefined {
     const categoryMap: { [key: string]: string } = {
         'top_rated': 'MOST_RATED',
         'favorite': 'MOST_FAVOURITE',
         'economic': 'PRICE_BY_ASC',
         'score': 'SCORE'
     };
     return categoryMap[category];
 }