# Internationalization, Content & Date Rules

## Locales
Initial: `ar-EG`/generic Arabic and `en`. Project/user can choose UI locale; academic content remains user-entered.

## Message Keys
All system copy via translation catalog. No hard-coded Arabic/English strings inside components beyond development placeholders.

## Dates
Store UTC; render in configured timezone. Show absolute date near critical deadlines; relative text may be supplemental (“بعد يومين”).

## Numbers
Locale formatting, tabular numerals for metrics. Project codes remain LTR isolated in RTL text using bidi-safe markup.

## Plurals
Use ICU plural rules, never string concatenation.

## Tone
Professional, calm, compact. Arabic should be clear Modern Standard Arabic with product-friendly wording; optional Egyptian copy should be a deliberate locale, not mixed accidentally.

## Translation QA
Pseudo-localization, overflow test, RTL screenshot set, missing-key CI check.
