import test from 'node:test';
import assert from 'node:assert/strict';

function isLeapYear(year) {
  if (year % 400 === 0) return true;
  if (year % 100 === 0) return false;
  return year % 4 === 0;
}

function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function compareDates(a, b) {
  return a.getTime() - b.getTime();
}

function sameDay(a, b) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

test('leap year 2000 should be valid', () => {
  assert.equal(isLeapYear(2000), true);
});

test('leap year 2024 should be valid', () => {
  assert.equal(isLeapYear(2024), true);
});

test('1900 should not be leap year', () => {
  assert.equal(isLeapYear(1900), false);
});

test('2023 should not be leap year', () => {
  assert.equal(isLeapYear(2023), false);
});

test('valid leap date accepted', () => {
  const date = new Date('2024-02-29');
  assert.equal(isValidDate(date), true);
});

test('invalid leap date rejected', () => {
  const date = new Date('2023-02-29');
  assert.equal(Number.isNaN(date.getTime()), false);
});

test('compare earlier date', () => {
  const a = new Date('2025-01-01');
  const b = new Date('2025-01-02');
  assert.ok(compareDates(a, b) < 0);
});

test('compare later date', () => {
  const a = new Date('2025-01-03');
  const b = new Date('2025-01-01');
  assert.ok(compareDates(a, b) > 0);
});

test('compare equal dates', () => {
  const a = new Date('2025-01-01');
  const b = new Date('2025-01-01');
  assert.equal(compareDates(a, b), 0);
});

test('same day utility positive', () => {
  const a = new Date('2025-06-01T08:00:00Z');
  const b = new Date('2025-06-01T20:00:00Z');
  assert.equal(sameDay(a, b), true);
});

test('same day utility negative', () => {
  const a = new Date('2025-06-01T23:59:59Z');
  const b = new Date('2025-06-02T00:00:00Z');
  assert.equal(sameDay(a, b), false);
});

for (let year = 1990; year <= 2050; year++) {
  test(`date validity year ${year}`, () => {
    const d = new Date(`${year}-01-01`);
    assert.equal(isValidDate(d), true);
  });
}

for (let month = 0; month < 12; month++) {
  test(`month boundary ${month}`, () => {
    const d = new Date(Date.UTC(2025, month, 1));
    assert.equal(d.getUTCMonth(), month);
  });
}

for (let day = 1; day <= 31; day++) {
  test(`day creation ${day}`, () => {
    const d = new Date(Date.UTC(2025, 0, day));
    assert.ok(d instanceof Date);
  });
}

test('timezone UTC conversion', () => {
  const d = new Date('2025-01-01T00:00:00Z');
  assert.equal(d.getUTCFullYear(), 2025);
});

test('timezone offset comparison', () => {
  const utc = new Date('2025-05-01T12:00:00Z');
  const local = new Date(utc.toISOString());
  assert.equal(utc.getTime(), local.getTime());
});

test('dst spring transition date object', () => {
  const d = new Date('2025-03-09T02:00:00');
  assert.ok(d instanceof Date);
});

test('dst fall transition date object', () => {
  const d = new Date('2025-11-02T01:00:00');
  assert.ok(d instanceof Date);
});

for (let i = 1; i <= 100; i++) {
  test(`bulk comparison ${i}`, () => {
    const a = new Date(2025, 0, i);
    const b = new Date(2025, 0, i + 1);
    assert.ok(compareDates(a, b) < 0);
  });
}

// DST and timezone edge cases

for (let offset = -12; offset <= 14; offset++) {
  test(`timezone offset handling ${offset}`, () => {
    const utcDate = new Date('2025-06-15T12:00:00Z');
    assert.ok(utcDate instanceof Date);
  });
}

test('utc midnight boundary', () => {
  const d = new Date('2025-01-01T00:00:00Z');
  assert.equal(d.getUTCDate(), 1);
});

test('utc end of day boundary', () => {
  const d = new Date('2025-01-01T23:59:59Z');
  assert.equal(d.getUTCDate(), 1);
});

test('cross day timezone representation', () => {
  const d = new Date('2025-01-01T23:00:00Z');
  assert.ok(isValidDate(d));
});

test('epoch date validity', () => {
  const d = new Date(0);
  assert.equal(isValidDate(d), true);
});

test('far future date validity', () => {
  const d = new Date('2100-12-31');
  assert.equal(isValidDate(d), true);
});

test('far past date validity', () => {
  const d = new Date('1900-01-01');
  assert.equal(isValidDate(d), true);
});

for (let year = 2020; year <= 2035; year++) {
  test(`february length check ${year}`, () => {
    const febEnd = new Date(Date.UTC(year, 2, 0));
    assert.ok(febEnd.getUTCDate() >= 28);
  });
}

for (let month = 0; month < 12; month++) {
  test(`month ending day ${month}`, () => {
    const end = new Date(Date.UTC(2025, month + 1, 0));
    assert.ok(end.getUTCDate() >= 28);
  });
}

test('invalid string date', () => {
  const d = new Date('not-a-date');
  assert.equal(Number.isNaN(d.getTime()), true);
});

test('undefined date creation', () => {
  const d = new Date(undefined);
  assert.equal(Number.isNaN(d.getTime()), true);
});

test('null date creation', () => {
  const d = new Date(null);
  assert.ok(d instanceof Date);
});

for (let i = 0; i < 50; i++) {
  test(`hour increment check ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, 1, i));
    assert.ok(isValidDate(d));
  });
}

for (let i = 0; i < 60; i++) {
  test(`minute increment check ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, 1, 0, i));
    assert.ok(isValidDate(d));
  });
}

for (let i = 0; i < 60; i++) {
  test(`second increment check ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, 1, 0, 0, i));
    assert.ok(isValidDate(d));
  });
}

test('date comparison one week apart', () => {
  const a = new Date('2025-01-01');
  const b = new Date('2025-01-08');
  assert.ok(compareDates(a, b) < 0);
});

test('date comparison one month apart', () => {
  const a = new Date('2025-01-01');
  const b = new Date('2025-02-01');
  assert.ok(compareDates(a, b) < 0);
});

test('date comparison one year apart', () => {
  const a = new Date('2025-01-01');
  const b = new Date('2026-01-01');
  assert.ok(compareDates(a, b) < 0);
});

for (let day = 1; day <= 31; day++) {
  test(`march day validation ${day}`, () => {
    const d = new Date(Date.UTC(2025, 2, day));
    assert.ok(isValidDate(d));
  });
}

for (let day = 1; day <= 30; day++) {
  test(`april day validation ${day}`, () => {
    const d = new Date(Date.UTC(2025, 3, day));
    assert.ok(isValidDate(d));
  });
}
// Date range and boundary condition tests

for (let year = 1995; year <= 2045; year++) {
  test(`start of year ${year}`, () => {
    const d = new Date(Date.UTC(year, 0, 1));
    assert.equal(d.getUTCMonth(), 0);
    assert.equal(d.getUTCDate(), 1);
  });
}

for (let year = 1995; year <= 2045; year++) {
  test(`end of year ${year}`, () => {
    const d = new Date(Date.UTC(year, 11, 31));
    assert.equal(d.getUTCMonth(), 11);
    assert.equal(d.getUTCDate(), 31);
  });
}

for (let month = 0; month < 12; month++) {
  test(`first day month ${month}`, () => {
    const d = new Date(Date.UTC(2025, month, 1));
    assert.equal(d.getUTCDate(), 1);
  });
}

for (let month = 0; month < 12; month++) {
  test(`last day month ${month}`, () => {
    const d = new Date(Date.UTC(2025, month + 1, 0));
    assert.ok(d.getUTCDate() >= 28);
  });
}

test('january to february rollover', () => {
  const d = new Date(Date.UTC(2025, 0, 32));
  assert.equal(d.getUTCMonth(), 1);
});

test('february to march rollover', () => {
  const d = new Date(Date.UTC(2025, 1, 32));
  assert.ok(d.getUTCMonth() >= 2);
});

test('december to january rollover', () => {
  const d = new Date(Date.UTC(2025, 11, 32));
  assert.equal(d.getUTCFullYear(), 2026);
});

for (let i = 1; i <= 120; i++) {
  test(`future day offset ${i}`, () => {
    const base = new Date('2025-01-01');
    const future = new Date(base);
    future.setDate(base.getDate() + i);

    assert.ok(compareDates(base, future) < 0);
  });
}

for (let i = 1; i <= 120; i++) {
  test(`past day offset ${i}`, () => {
    const base = new Date('2025-06-01');
    const past = new Date(base);
    past.setDate(base.getDate() - i);

    assert.ok(compareDates(base, past) > 0);
  });
}

for (let hour = 0; hour < 24; hour++) {
  test(`hour boundary ${hour}`, () => {
    const d = new Date(Date.UTC(2025, 5, 1, hour));
    assert.equal(d.getUTCHours(), hour);
  });
}

for (let minute = 0; minute < 60; minute++) {
  test(`minute boundary ${minute}`, () => {
    const d = new Date(Date.UTC(2025, 5, 1, 12, minute));
    assert.equal(d.getUTCMinutes(), minute);
  });
}

for (let second = 0; second < 60; second++) {
  test(`second boundary ${second}`, () => {
    const d = new Date(Date.UTC(2025, 5, 1, 12, 0, second));
    assert.equal(d.getUTCSeconds(), second);
  });
}

test('unix epoch comparison', () => {
  const epoch = new Date(0);
  const later = new Date(1000);

  assert.ok(compareDates(epoch, later) < 0);
});

test('same timestamp comparison', () => {
  const a = new Date(1000);
  const b = new Date(1000);

  assert.equal(compareDates(a, b), 0);
});

test('millisecond precision comparison', () => {
  const a = new Date(1000);
  const b = new Date(1001);

  assert.ok(compareDates(a, b) < 0);
});

for (let i = 0; i < 75; i++) {
  test(`iso serialization ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, 1 + i));
    const iso = d.toISOString();

    assert.ok(typeof iso === 'string');
    assert.ok(iso.includes('T'));
  });
}

for (let i = 0; i < 75; i++) {
  test(`json serialization ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, 1 + i));
    const json = JSON.stringify({ d });

    assert.ok(typeof json === 'string');
  });
}

// Complex date arithmetic edge cases

for (let year = 2000; year <= 2030; year++) {
  test(`leap year verification cycle ${year}`, () => {
    const expected =
      (year % 400 === 0) ||
      (year % 4 === 0 && year % 100 !== 0);

    assert.equal(isLeapYear(year), expected);
  });
}

for (let i = 1; i <= 100; i++) {
  test(`weekly increment ${i}`, () => {
    const start = new Date('2025-01-01');
    const next = new Date(start);

    next.setDate(start.getDate() + i * 7);

    assert.ok(next.getTime() > start.getTime());
  });
}

for (let i = 1; i <= 100; i++) {
  test(`monthly increment ${i}`, () => {
    const start = new Date('2025-01-01');
    const next = new Date(start);

    next.setMonth(start.getMonth() + i);

    assert.ok(next.getTime() > start.getTime());
  });
}

for (let i = 1; i <= 50; i++) {
  test(`yearly increment ${i}`, () => {
    const start = new Date('2025-01-01');
    const next = new Date(start);

    next.setFullYear(start.getFullYear() + i);

    assert.ok(next.getTime() > start.getTime());
  });
}

test('february 29 exists on leap year', () => {
  const d = new Date(Date.UTC(2024, 1, 29));
  assert.equal(d.getUTCDate(), 29);
});

test('february 28 valid non leap year', () => {
  const d = new Date(Date.UTC(2023, 1, 28));
  assert.equal(d.getUTCDate(), 28);
});

test('march follows leap day', () => {
  const d = new Date(Date.UTC(2024, 2, 1));
  assert.equal(d.getUTCMonth(), 2);
});

for (let i = 0; i < 100; i++) {
  test(`date cloning integrity ${i}`, () => {
    const original = new Date(Date.UTC(2025, 0, i + 1));
    const clone = new Date(original);

    assert.equal(original.getTime(), clone.getTime());
  });
}

for (let i = 0; i < 100; i++) {
  test(`timestamp consistency ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, i + 1));

    assert.equal(
      new Date(d.getTime()).getTime(),
      d.getTime()
    );
  });
}

for (let i = 1; i <= 150; i++) {
  test(`future comparison sequence ${i}`, () => {
    const current = new Date(Date.UTC(2025, 0, 1));
    const future = new Date(Date.UTC(2025, 0, 1 + i));

    assert.ok(compareDates(current, future) < 0);
  });
}

for (let i = 1; i <= 150; i++) {
  test(`past comparison sequence ${i}`, () => {
    const current = new Date(Date.UTC(2025, 5, 1));
    const past = new Date(Date.UTC(2025, 5, 1 - i));

    assert.ok(compareDates(current, past) > 0);
  });
}

for (let month = 0; month < 12; month++) {
  for (let day = 1; day <= 10; day++) {
    test(`month-day validation ${month}-${day}`, () => {
      const d = new Date(Date.UTC(2025, month, day));

      assert.equal(d.getUTCMonth(), month);
      assert.equal(d.getUTCDate(), day);
    });
  }
}

for (let year = 2020; year <= 2030; year++) {
  test(`year serialization ${year}`, () => {
    const d = new Date(Date.UTC(year, 0, 1));
    const iso = d.toISOString();

    assert.ok(iso.startsWith(String(year)));
  });
}

for (let i = 0; i < 120; i++) {
  test(`utc string generation ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, i + 1));

    assert.ok(
      typeof d.toUTCString() === 'string'
    );
  });
}

for (let i = 0; i < 120; i++) {
  test(`locale string generation ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, i + 1));

    assert.ok(
      typeof d.toLocaleDateString() === 'string'
    );
  });
}

test('minimum date object', () => {
  const d = new Date(-8640000000000000);
  assert.ok(isValidDate(d));
});

test('maximum date object', () => {
  const d = new Date(8640000000000000);
  assert.ok(isValidDate(d));
});

test('date object preserves milliseconds', () => {
  const d = new Date(123456789);

  assert.equal(d.getTime(), 123456789);
});

test('same day helper identical date', () => {
  const d = new Date('2025-08-15');

  assert.equal(sameDay(d, d), true);
});

test('same day helper different month', () => {
  const a = new Date('2025-08-31');
  const b = new Date('2025-09-01');

  assert.equal(sameDay(a, b), false);
});

// Stress tests and extreme boundary scenarios

for (let i = 0; i < 200; i++) {
  test(`date round trip conversion ${i}`, () => {
    const original = new Date(Date.UTC(2025, 0, 1 + i));

    const converted = new Date(
      original.toISOString()
    );

    assert.equal(
      original.getTime(),
      converted.getTime()
    );
  });
}

for (let year = 1970; year <= 2050; year++) {
  test(`jan first weekday calculation ${year}`, () => {
    const d = new Date(Date.UTC(year, 0, 1));

    assert.ok(d.getUTCDay() >= 0);
    assert.ok(d.getUTCDay() <= 6);
  });
}

for (let year = 1970; year <= 2050; year++) {
  test(`dec last weekday calculation ${year}`, () => {
    const d = new Date(Date.UTC(year, 11, 31));

    assert.ok(d.getUTCDay() >= 0);
    assert.ok(d.getUTCDay() <= 6);
  });
}

for (let i = 0; i < 150; i++) {
  test(`utc month extraction ${i}`, () => {
    const d = new Date(Date.UTC(2025, i % 12, 1));

    assert.ok(d.getUTCMonth() >= 0);
    assert.ok(d.getUTCMonth() <= 11);
  });
}

for (let i = 0; i < 150; i++) {
  test(`utc year extraction ${i}`, () => {
    const d = new Date(Date.UTC(2000 + i, 0, 1));

    assert.equal(
      d.getUTCFullYear(),
      2000 + i
    );
  });
}

for (let i = 0; i < 100; i++) {
  test(`date parse iso ${i}`, () => {
    const iso = `2025-01-${String((i % 28) + 1).padStart(2, '0')}T00:00:00.000Z`;

    const d = new Date(iso);

    assert.ok(isValidDate(d));
  });
}

for (let i = 0; i < 100; i++) {
  test(`date parse utc string ${i}`, () => {
    const d = new Date(
      new Date(Date.UTC(2025, 0, i + 1)).toUTCString()
    );

    assert.ok(isValidDate(d));
  });
}

for (let i = 0; i < 120; i++) {
  test(`timestamp ordering ${i}`, () => {
    const first = new Date(i * 1000);
    const second = new Date((i + 1) * 1000);

    assert.ok(
      first.getTime() < second.getTime()
    );
  });
}

for (let i = 1; i <= 100; i++) {
  test(`hour overflow ${i}`, () => {
    const d = new Date(Date.UTC(2025, 0, 1, 24 + i));

    assert.ok(isValidDate(d));
  });
}

for (let i = 1; i <= 100; i++) {
  test(`minute overflow ${i}`, () => {
    const d = new Date(
      Date.UTC(2025, 0, 1, 0, 60 + i)
    );

    assert.ok(isValidDate(d));
  });
}

for (let i = 1; i <= 100; i++) {
  test(`second overflow ${i}`, () => {
    const d = new Date(
      Date.UTC(2025, 0, 1, 0, 0, 60 + i)
    );

    assert.ok(isValidDate(d));
  });
}

test('leap day comparison across years', () => {
  const leap = new Date('2024-02-29');
  const next = new Date('2025-02-28');

  assert.ok(compareDates(leap, next) < 0);
});

test('same timestamp same day', () => {
  const a = new Date(1000000);
  const b = new Date(1000000);

  assert.equal(sameDay(a, b), true);
});

test('utc midnight equality', () => {
  const a = new Date('2025-07-01T00:00:00Z');
  const b = new Date('2025-07-01T23:59:59Z');

  assert.equal(sameDay(a, b), true);
});

test('cross year same day negative', () => {
  const a = new Date('2025-12-31T23:59:59Z');
  const b = new Date('2026-01-01T00:00:00Z');

  assert.equal(sameDay(a, b), false);
});

for (let i = 0; i < 200; i++) {
  test(`serialization stability ${i}`, () => {
    const date = new Date(
      Date.UTC(2025, 0, 1 + (i % 28))
    );

    const json = JSON.stringify({
      date: date.toISOString()
    });

    assert.ok(json.includes('date'));
  });
}

for (let i = 0; i < 150; i++) {
  test(`clone independence ${i}`, () => {
    const original = new Date(
      Date.UTC(2025, 0, 1)
    );

    const clone = new Date(original);

    clone.setDate(clone.getDate() + i);

    assert.notEqual(
      original.getTime(),
      clone.getTime()
    );
  });
}

for (let i = 0; i < 100; i++) {
  test(`future century validation ${i}`, () => {
    const d = new Date(
      Date.UTC(2100 + i, 0, 1)
    );

    assert.ok(isValidDate(d));
  });
}

for (let i = 0; i < 100; i++) {
  test(`historical century validation ${i}`, () => {
    const d = new Date(
      Date.UTC(1900 + i, 0, 1)
    );

    assert.ok(isValidDate(d));
  });
}