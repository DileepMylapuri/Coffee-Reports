// Country and flag lookups for ports and origins. Only the flags used are imported,
// so the bundle doesn't pull in the whole flag-icons set.
import be from 'flag-icons/flags/4x3/be.svg'
import bi from 'flag-icons/flags/4x3/bi.svg'
import br from 'flag-icons/flags/4x3/br.svg'
import co from 'flag-icons/flags/4x3/co.svg'
import cr from 'flag-icons/flags/4x3/cr.svg'
import de from 'flag-icons/flags/4x3/de.svg'
import es from 'flag-icons/flags/4x3/es.svg'
import fr from 'flag-icons/flags/4x3/fr.svg'
import eng from 'flag-icons/flags/4x3/gb-eng.svg'
import gt from 'flag-icons/flags/4x3/gt.svg'
import hn from 'flag-icons/flags/4x3/hn.svg'
import india from 'flag-icons/flags/4x3/in.svg'
import it from 'flag-icons/flags/4x3/it.svg'
import ke from 'flag-icons/flags/4x3/ke.svg'
import mx from 'flag-icons/flags/4x3/mx.svg'
import ni from 'flag-icons/flags/4x3/ni.svg'
import nl from 'flag-icons/flags/4x3/nl.svg'
import pe from 'flag-icons/flags/4x3/pe.svg'
import pg from 'flag-icons/flags/4x3/pg.svg'
import rw from 'flag-icons/flags/4x3/rw.svg'
import sv from 'flag-icons/flags/4x3/sv.svg'
import tz from 'flag-icons/flags/4x3/tz.svg'
import ug from 'flag-icons/flags/4x3/ug.svg'
import us from 'flag-icons/flags/4x3/us.svg'
import ve from 'flag-icons/flags/4x3/ve.svg'

const NETHERLANDS = { country: 'Netherlands', flag: nl }
const GERMANY = { country: 'Germany', flag: de }
const ENGLAND = { country: 'England', flag: eng }
const ITALY = { country: 'Italy', flag: it }
const USA = { country: 'USA', flag: us }

// Robusta warehouses, keyed by the code prefix used in the data ("ANT-Antwerp").
const ROBUSTA_PORTS = {
  AMS: NETHERLANDS,
  ANT: { country: 'Belgium', flag: be },
  BAR: { country: 'Spain', flag: es },
  BRE: GERMANY,
  FEL: ENGLAND,
  GEN: ITALY,
  HAM: GERMANY,
  LEH: { country: 'France', flag: fr },
  LIV: ENGLAND,
  LON: ENGLAND,
  NOR: ENGLAND,
  ROT: NETHERLANDS,
  TRI: ITALY,
}

export const robustaPortPlace = (port) => ROBUSTA_PORTS[port.split('-')[0].toUpperCase()] ?? {}

export const ARABICA_PORT_PLACES = {
  antwerp: { country: 'Belgium', flag: be },
  barcelona: { country: 'Spain', flag: es },
  hamburg: GERMANY,
  houston: USA,
  miami: USA,
  newOrleans: USA,
  newYork: USA,
  virginia: USA,
}

const ORIGIN_FLAGS = {
  Brazil: br,
  Burundi: bi,
  Colombia: co,
  'Costa Rica': cr,
  'El Salvador': sv,
  Guatemala: gt,
  Honduras: hn,
  India: india,
  Kenya: ke,
  Mexico: mx,
  Nicaragua: ni,
  'Papua New Guinea': pg,
  Peru: pe,
  Rwanda: rw,
  Tanzania: tz,
  Uganda: ug,
  Venezuela: ve,
}

export const originFlag = (origin) => ORIGIN_FLAGS[origin]
