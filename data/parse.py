#!/usr/bin/python3

import json
import csv

#"id","ident","type","name","latitude_deg","longitude_deg","elevation_ft","continent","iso_country","iso_region","municipality","scheduled_service","gps_code","iata_code","local_code","home_link","wikipedia_link","keywords"
airport_columns = ["id", "icao", "type", "name", "lat", "lon", "elevation", "continent", "iso_country", "iso_region", "munincipality", "scheduled_service", "gps_code", "iata", "local", "url", "wikipedia", "keywords"]
#airport_columns = ["id", "name", "city", "country", "iata-faa", "icao", "lat", "lon", "elevation", "timezone", "dst", "tzdb"]

def parse_airports(filename="airports.csv"):
  airports = []
  with open(filename, newline="") as f:
    reader = csv.reader(f)
    rows = 0
    for row in reader:
      if row[0] == "id": continue
      data = {}
      i = 0
      for k in airport_columns:
        data[k] = row[i]
        i += 1

      data["icao"] = data["icao"].lower()

      if data["elevation"] != "":
        data["elevation"] = float(data["elevation"])
      else:
        data["elevation"] = -1
      data["lat"]       = float(data["lat"])
      data["lon"]       = float(data["lon"])

      #if data["scheduled_service"] == "yes":
      #  data["scheduled_service"] = True
      #else:
      #  data["scheduled_service"] = False

      # convert feet to meters
      data["elevation"] = data["elevation"] * 0.3048

      data["location"]  = [data["lat"], data["lon"]]

      if   data["type"] == "closed": continue
      elif data["type"] == "small_airport":  data["type"] = "small"
      elif data["type"] == "medium_airport": data["type"] = "medium"
      elif data["type"] == "large_airport":  data["type"] = "large"
      elif data["type"] == "heliport":       data["type"] = "heliport"
      elif data["type"] == "seaplane_base":  data["type"] = "seaport"
      elif data["type"] == "balloonport":    data["type"] = "balloonport"

      airports.append(data)

      rows += 1
  return airports

def airport_to_json(airports):
  obj = []
  for a in airports:
    if a["type"] not in ["small", "medium", "large"]: continue
    # obj.append({
    #   "icao":      a["icao"],
    #   "name":      a["name"],
    #   "location":  a["location"],
    #   "type":      a["type"],
    #   "elevation": a["elevation"]
    # })
    print(a["icao"])
    obj.append([
      a["icao"],
      a["name"],
      a["location"],
      a["elevation"],
      a["type"],
    ])
  return obj

if __name__ == "__main__":
  airports = parse_airports("airports.csv")
  airports = json.dumps(airport_to_json(airports))
  with open("airports.json", "w") as f:
    f.write(airports)
