import { useState } from 'react';
import type { Contact, TimeSlot } from '../state';
import { timeSlotLabels } from '../ui/texts';

interface Props {
  contact: Contact;
  postcode: string;
  onChange: (contact: Contact) => void;
  onBack: () => void;
  onSubmit: () => void;
}

type Errors = Partial<Record<keyof Contact, string>>;

function validate(c: Contact): Errors {
  const errors: Errors = {};
  if (c.name.trim() === '') errors.name = 'Bitte Ihren Namen angeben.';
  if (c.phone.replace(/\D/g, '').length < 6) errors.phone = 'Bitte eine Telefonnummer angeben, damit wir einen Termin abstimmen können.';
  if (c.email.trim() !== '' && !/^\S+@\S+\.\S+$/.test(c.email.trim())) errors.email = 'Bitte eine gültige E-Mail-Adresse angeben.';
  if (c.street.trim() === '') errors.street = 'Bitte Straße und Hausnummer angeben.';
  if (c.city.trim() === '') errors.city = 'Bitte den Ort angeben.';
  if (!c.consent) errors.consent = 'Bitte stimmen Sie zu, damit wir Sie kontaktieren dürfen.';
  return errors;
}

export function ContactStep({ contact, postcode, onChange, onBack, onSubmit }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const errors = submitted ? validate(contact) : {};
  const set = <K extends keyof Contact>(key: K, value: Contact[K]) => onChange({ ...contact, [key]: value });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(contact);
    if (Object.keys(found).length === 0) {
      onSubmit();
    } else {
      document.getElementById(`contact-${Object.keys(found)[0]}`)?.focus();
    }
  }

  return (
    <section>
      <h1>Kostenloses Aufmaß anfragen</h1>
      <p className="lead">
        Ein Mitarbeiter kommt bei Ihnen vorbei, misst alle Fenster genau aus und berät Sie zu den Details. Danach bekommen
        Sie ein verbindliches Angebot.
      </p>

      <form className="card" onSubmit={submit} noValidate>
        <TextField id="name" label="Name" autoComplete="name" value={contact.name} onChange={(v) => set('name', v)} error={errors.name} />
        <TextField
          id="phone"
          label="Telefon"
          type="tel"
          autoComplete="tel"
          value={contact.phone}
          onChange={(v) => set('phone', v)}
          error={errors.phone}
        />
        <TextField
          id="email"
          label="E-Mail (optional)"
          type="email"
          autoComplete="email"
          value={contact.email}
          onChange={(v) => set('email', v)}
          error={errors.email}
        />
        <TextField
          id="street"
          label="Straße und Hausnummer"
          autoComplete="street-address"
          value={contact.street}
          onChange={(v) => set('street', v)}
          error={errors.street}
        />
        <div className="city-row">
          <div className="field">
            <label htmlFor="contact-postcode">PLZ</label>
            <input id="contact-postcode" value={postcode} readOnly aria-readonly="true" />
          </div>
          <TextField id="city" label="Ort" autoComplete="address-level2" value={contact.city} onChange={(v) => set('city', v)} error={errors.city} />
        </div>

        <fieldset>
          <legend>Wann passt ein Termin am besten?</legend>
          <div className="segmented">
            {(Object.keys(timeSlotLabels) as TimeSlot[]).map((slot) => (
              <label key={slot} className={contact.timeSlot === slot ? 'selected' : ''}>
                <input type="radio" name="timeSlot" checked={contact.timeSlot === slot} onChange={() => set('timeSlot', slot)} />
                {timeSlotLabels[slot]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor="contact-message">Nachricht (optional)</label>
          <textarea
            id="contact-message"
            rows={3}
            placeholder="z. B. Wünsche zur Farbe oder wann Sie gut erreichbar sind"
            value={contact.message}
            onChange={(e) => set('message', e.target.value)}
          />
        </div>

        <label className="toggle consent">
          <input
            id="contact-consent"
            type="checkbox"
            checked={contact.consent}
            onChange={(e) => set('consent', e.target.checked)}
          />
          <span className="toggle-text">
            <span>Fenster Nord darf mich zur Terminabstimmung kontaktieren. Meine Daten werden nur dafür verwendet.</span>
          </span>
        </label>
        {errors.consent && <p className="error">{errors.consent}</p>}

        <p className="demo-note">Demo: Die Anfrage wird nicht verschickt. Sie sehen danach eine Zusammenfassung.</p>

        <div className="actions two">
          <button type="button" className="button secondary" onClick={onBack}>
            Zurück
          </button>
          <button type="submit" className="button primary">
            Anfrage absenden
          </button>
        </div>
      </form>
    </section>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
}

function TextField({ id, label, value, onChange, error, type = 'text', autoComplete }: TextFieldProps) {
  const fullId = `contact-${id}`;
  return (
    <div className="field">
      <label htmlFor={fullId}>{label}</label>
      <input
        id={fullId}
        type={type}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fullId}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="error" id={`${fullId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
