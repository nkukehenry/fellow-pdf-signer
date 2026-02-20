/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#0054FF', // Adobe-like Blue
                    600: '#0047D6',
                    700: '#0039AC',
                    800: '#002B82',
                    900: '#001E58',
                    950: '#001133',
                },
                adobe: {
                    red: '#EB1000',
                    blue: '#0054FF',
                    gray: '#F5F5F5',
                }
            },
            fontFamily: {
                signature: ['"Great Vibes"', 'cursive'],
                script: ['"Dancing Script"', 'cursive'],
                serif: ['"Playfair Display"', 'serif'],
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
