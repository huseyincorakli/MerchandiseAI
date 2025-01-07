const categories = ["top_rated", "economic", "favorite", "score", "irrelevant"] as const;
const currencies = ["TRY", "USD", "EUR", "GBP"] as const;

class QueryGrader {
    private isNull(value: any): boolean {
        return value === null || value === "null";
    }

    gradeOutput(output: any) {
        try {
            // check all properties
            if (!output.hasOwnProperty('category') ||
                !output.hasOwnProperty('productName') ||
                !output.hasOwnProperty('price') ||
                !output.hasOwnProperty('currency') ||
                !output.hasOwnProperty('description')) {
                return { isValid: false };
            }

            // check category
            if (!categories.includes(output.category)) {
                return { isValid: false };
            }

            // check price format
            if (!this.isNull(output.price)) {
                const priceRegex = /^\d+-(?:\d+|∞)$/;
                if (!priceRegex.test(output.price)) {
                    return { isValid: false };
                }
            }

            // check currency
            if (!this.isNull(output.currency) && !currencies.includes(output.currency)) {
                return { isValid: false };
            }

            // check irrelevant category
            if (output.category === "irrelevant") {
                if (output.productName !== "none" ||
                    !this.isNull(output.price) ||
                    !this.isNull(output.currency) ||
                    this.isNull(output.description)) {
                    return { isValid: false };
                }
            }

            return { isValid: true };
        } catch (error) {
            return { isValid: false };
        }
    }
}

export { QueryGrader };