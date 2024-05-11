<p align="center"><img src="assets/logo.jpg"></p>
<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/karannakra/super-calendar/check.yml">
  <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square">
</p>

# Super-calendar

Super-calendar is a powerful and versatile JavaScript library for converting human-friendly date inputs into date objects.

## Installation

You can install Super-calendar via npm, yarn, pnpm:

### npm

```bash
npm install super-calendar

```

### yarn

```bash
yarn add super-calendar
```

### pnpm

```bash
pnpm install super-calendar
```

### Usage

```js
import { parseDate } from "super-calendar";

const dateSuggestions = parseDate({ query: "monday" });
```

### Options

```js
/**
 * Takes a string of fallback dates, if parser is not able
 * to parse the string input these predefined string values will
 * generate dates and return in suggestions array
 * */
fallback?: string[];

/**
 * Whether to parseTime, default is true
 * */
parseTime?: boolean;

/**
 * Default hour to apply to parsed / suggested dates
 * */
hour?: number | null;


/**
 * Default minute to apply to parsed / suggested dates
 * */
minute?: number | null;

/**
 * Default second to apply to parsed / suggested dates
 * */
second?: number | null;

/**
 * Options like timezone or forwardDate for chrono node
 * */
options: chrono.ParsingOption | undefined[]

/**
 *  Reference date for chrono to improve parsing to the right date
 * */
ref?: Date | undefined;

```

## Detailed Usage Example

Here's a more detailed usage example demonstrating different inputs:

1. Run in root folder

```bash
pnpm pack
# or
yarn pack
# or
npm pack

```

2. Install the package in example folder and run the developement server.

```bash
pnpm install
pnpm run dev
# or
yarn install
yarn run dev
# or
npm install
npm run dev

```

## Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, feel free to open an issue or submit a pull request. Please follow the contribution guidelines when contributing to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Project Stats

![Alt](https://repobeats.axiom.co/api/embed/a0a657ae2989fe461f290002fb7cf2c205d1bd3b.svg "Repobeats analytics image")
