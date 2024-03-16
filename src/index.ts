import * as chrono from "chrono-node";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";
import {
  fixedDate,
  inUnits,
  nextUnits,
  shortcutRegex,
  stringToInt,
  stringToMonth,
  weekdays,
} from "./constants";

dayjs.extend(objectSupport);

// suggestions range

let savedResults: chrono.ParsedResult[] = [];

type ParsedDateProps = {
  query: string | undefined;
  parseTime?: boolean;
  hour?: number | null;
  minute?: number | null;
  second?: number | null;
  fallback?: string[];
  ref?: Date | undefined;
  options?: chrono.ParsingOption | undefined; // options like timezone or forwardDate
};

export function parseDate({
  query: query0 = "",
  ref,
  options,
}: ParsedDateProps) {
  let query = query0;
  let selectedLocale = "en";

  const q =
    (query.length < 3 && stringToMonth[query]) || query?.toLocaleLowerCase();

  const parsingOptions = [q, ref, options];

  const shortcutMatched = query.match(shortcutRegex);

  if (shortcutMatched) {
    query = query.replace(shortcutRegex, "$1 $2"); // capture query string like "2pm" and replace it with "2 pm"
  }

  let results = chrono.parse.apply(chrono, parsingOptions);

  if (!results.length) {
    results = chrono.ru.parse.apply(chrono, parsingOptions);
    if (results.length) {
      selectedLocale = "ru";
    }
  }
  // handling that chrono will forget the result while typing from e.g. 'nov' ... 'november'
  if (
    !query.length ||
    (!results.length &&
      !!savedResults.length &&
      !savedResults[0].text.includes(query))
  ) {
    savedResults = []; // reset savedResults on empty query
  } else if (results.length) {
    savedResults = results;
  } else {
    results = savedResults;
  }

  const shortcut = query.split(" ")[0];

  const findSubstrings = (predString: string) =>
    predString.substring(0, shortcut.length) === shortcut;

  const isThis = findSubstrings("this"); // beginning of 'this ...'
  const isNext = findSubstrings("next"); // beginning of 'next ...'
  const isIn = findSubstrings("in"); // beginning of 'in ...'
  const isOn = findSubstrings("on"); // beginning of 'on ...'
  const isNumber = Number.isInteger(Number(shortcut.trim())); // beginning with number, e.g. '6' -> '6 days'

  // Ussed to filter suggestion ranges. will capture whatever is after the shortcut
  let what = query.split(" ")[1];
  let stage; // stage is used if 'what' identified to filter range before building suggestions
  let suggestions: any[] = [];

  // calculate suggestions when user inputs a query, else show default
  if (query && !!query.trim().length) {
    // if no shortcut, use default
    suggestions = fixedDate.filter(v => v.includes(query.split(" ")[0]));

    // if using 'this'-shortcut, and no other shortcuts are in play
    if (isThis && !isNext && !isIn && !isOn && !isNumber) {
      stage = weekdays;
      if (what) stage = stage.filter(v => v.includes(what));
      suggestions = suggestions.concat(stage.map(string => "this " + string));
    }
    // if using 'next'-shortcut, and no other shortcuts are in play
    else if (isNext && !isIn && !isOn && !isThis && !isNumber) {
      stage = weekdays.concat(nextUnits);
      if (what) stage = stage.filter(v => v.includes(what));
      suggestions = suggestions.concat(stage.map(string => "next " + string));
    }
    // if no shortcut in play, try weekdays
    else if (!isNext && !isIn && !isThis && !isNumber) {
      stage = weekdays;
      if (what) stage = stage.filter(v => v.includes(what));
      const strictFilter =
        (query.split(" ").filter(v => !!v.length).length <= 1 && !isOn) ||
        (query.split(" ").filter(v => !!v.length).length > 1 && isOn) ||
        !!results.length;
      stage = isOn
        ? stage
        : strictFilter
          ? stage.filter(
              string => string === query || string.includes(query.split(" ")[0])
            )
          : stage.filter(
              string =>
                string === query ||
                !!query.split(" ").filter(subQuery => string.includes(subQuery))
                  .length
            );
      suggestions = suggestions.concat(stage.map(string => "on " + string));
    }

     // if using 'in'-shortcut, or first string is number */
     else if (!isNext && !isThis && !isOn) {
        // checks both numbers and frequently used strings that mean numbers
        const number =
            Number(query.split(" ")[0]) ||
            Number(stringToInt[query.split(" ")[0].substring(0, 2)]) ||
            (isIn && (Number(what) || (what && Number(stringToInt[what.substring(0, 2)]))));
        stage = inUnits;
        // this is a bit hacky, but it basically just replace the 'what' based on wether query starts with 'in ...'
        what = isIn ? query.split(" ")[2] : what;
        if (what) stage = stage.filter(v => v.includes(what));
        // if there is a valid number, we will use that
        if (!isOn) {
            suggestions = suggestions.concat(
                stage.map(string => {
                    const showText = number === 1 || !number;
                    const val = showText ? (string === "hours" ? "an" : "a") : number;
                    const unit = showText ? string.substring(0, string.length - 1) : string;
                    return "in " + val + " " + unit;
                })
            );
        }
    }
  }
  return [suggestions, selectedLocale]; // hack to prevent eslint from complaining
}

parseDate({query:"next"})