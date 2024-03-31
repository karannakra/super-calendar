import * as chrono from "chrono-node";
import dayjs from "dayjs";
import objectSupport from "dayjs/plugin/objectSupport";
import {
  fixedDate,
  dayJsUnits,
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
  ref, // reference date for chrono to improve parsing to the right date
  fallback = [], // default suggestion list, when no query (will be parsed by chrono)
  hour = 0, // default hour to apply to parsed / suggested dates
  parseTime = true, // wether to parseTime, default is false
  minute = 0, // default minute to apply to parsed / suggested dates
  second = 10, // default second to apply to parsed / suggested dates
  options = { forwardDate: true }, // options for chrono, e.g. { forwardDate: true } to optimize for dates in the future (see docs)
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

  let results = chrono.parse.apply(
    chrono,
    parsingOptions
  ) as chrono.en.ParsedResult[];
  let additonalResults: dayjs.Dayjs[] = [];

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

  const now = dayjs().set({ second: 0 });
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
        (isIn &&
          (Number(what) ||
            (what && Number(stringToInt[what.substring(0, 2)]))));
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
            const unit = showText
              ? string.substring(0, string.length - 1)
              : string;
            return "in " + val + " " + unit;
          })
        );
      }
    }
  }
  // fallback value, to show when no query
  else {
    suggestions = fallback;
  }
  // if there is a result with a known time, use that else use default;
  let time = { hour, minute, second };
  if (results.length) {
    const hour = results[0].start.get("hour");
    const minute = results[0].start.get("minute");
    if (hour) time = { hour, minute, second };
  }

  // builds the suggestion object
  suggestions = suggestions
    .filter(v => !!v)
    .map(label => {
      const dates =
        selectedLocale === "en"
          ? chrono.parse(label, ref, options)
          : chrono.ru.parse(label, ref, options);
      // if the result has a known time, use that else use default

      const getTime = (time: string) =>
        dates[0]?.start.get.call(dates[0]?.start, time);

      const hour = getTime("hour");
      const minute = getTime("minute");
      const second = getTime("second");

      // this is a hack to handle that chrono has a different understanding of what 'this' and 'next' means that I do
      // Chrono works by week number, where on tuesday in W23 'this monday' means Mon in W23 not Mon in W24
      // and where on tuesday in W23 'next monday' means Mon in W24 not Mon in W25
      const parsedLabel =
        label +
        ` ${hour || time.hour}:${minute || time.minute || 0}:${time.second || second || 0}`;
      let date = dayjs(
        selectedLocale === "en"
          ? chrono.parseDate(parsedLabel, ref, options)
          : chrono.ru.parseDate(parsedLabel, ref, options)
      );
      if (date.isBefore(now) && ["this", "on"].includes(label.split(" ")[0])) {
        date = date.add(1, "week");
      }
      if (
        date.isBefore(now.clone().add(1, "week")) &&
        label.split(" ")[0]?.trim() === "next"
      ) {
        date = date.add(1, "week");
      }
      return { label, date: date.toDate() };
    });

  const actual = results
    // see filter under suggestions...
    .filter(
      r =>
        !["this", "on"].includes(r.text.split(" ")[0]) &&
        !(r.text.includes("mon") && r.start.get("weekday") === 1)
    )
    .map(r => {
      const dayjsDateObject: { [c in chrono.Component]?: number } =
        dayJsUnits.reduce((prevValue, unit) => {
          let value = r.start.get(unit);
          if (unit === "month" && value) {
            value -= 1; // dayjs month is 0 indexed ex. 0 is jan
          }
          return { ...prevValue, [unit === "day" ? "date" : unit]: value };
        }, {});
      return dayjs().set(dayjsDateObject);
    });
  // if only a single result, we will try creating more based on the known values from our chrono result

  if (
    actual.length === 1 &&
    !isThis &&
    !isNext &&
    !isIn &&
    !isOn &&
    !isNumber
  ) {
    const dayjsDateObject = dayJsUnits.reduce((prevValue, unit) => {
      let value = results[0].start.get(unit);
      if (unit === "month" && value) {
        value -= 1; // dayjs month is 0 indexed ex. 0 is jan
      }
      return { ...prevValue, [unit === "day" ? "date" : unit]: value };
    }, {});
    const knownValues = Object.keys(dayjsDateObject);
    const hasWeekday = knownValues.includes("weekday");
    const hasMonth = knownValues.includes("month");
    const hasDay = false;
    const hasYear = knownValues.includes("year");
    const hasTime = knownValues.includes("hour");
    if (!(hasYear && hasMonth && hasDay)) {
      if (hasTime || !parseTime) additonalResults = [];
      else {
        // chosen interval based on what we know from chrono
        const interval = hasTime
          ? "hour"
          : hasWeekday
            ? "week"
            : hasMonth && hasDay
              ? parseTime
                ? "hour"
                : "year"
              : "day";
        // creates two additional results adding 1 and 2 units to the chosen interval
        additonalResults = [1, 2].map(i => {
          return actual[0].clone().add(i, interval);
        });
      }
    }
  }

  const updatedResult = actual.concat(additonalResults).map(date => {
    const isThisYear = now.isSame(date, "year") && now.isBefore(date);
    const isPastTime = dayjs(date.toDate()).isBefore(dayjs(), "minute");
    const differenceInHours = dayjs(date.toDate()).diff(dayjs(), "hour");
    const isFutureDateRequired = isPastTime && differenceInHours >= -23;
    // Here -23 is taken because we need to check if the difference of past time is not more then 1 day
    // then add a day in current date and suggest the time
    const dateAfterADay = date.add(1, "day");
    const selectedDate = isFutureDateRequired ? dateAfterADay : date;
    return {
      label:
        "on " + selectedDate.format("MMMM D" + (!isThisYear ? " YYYY" : "")),
      date: selectedDate.toDate(),
    };
  });
  // merges the suggestions with the results, to make sure no date is shown twice
  // prioritise the suggestions, because it has better labelling
  suggestions = suggestions
    .concat(updatedResult)
    .filter((dateItem, index, currentArray) => {
      const indexOfDate = currentArray.findIndex(date =>
        dayjs(date.date).isSame(dateItem.date, "minute")
      );
      return (
        dayjs(dateItem.date).isValid() &&
        indexOfDate === index &&
        dayjs(dateItem.date).isAfter(dayjs())
      );
    })
    .sort((a, b) =>
      dayjs(a.date).isBefore(b.date) ? -1 : dayjs(a.date).isSame(b.date) ? 0 : 1
    )
    .slice(0, 3);
  return suggestions;
}

parseDate({ query: "" });
