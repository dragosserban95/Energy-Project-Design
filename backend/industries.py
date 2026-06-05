"""Industries & subdomains catalog.

Currently only 'gas_engineering' is active. The architecture supports adding
more industries (electrical, water/sewage, civil, telecom etc.) by extending
this catalog. Each industry can have one or more subdomains. Each subdomain
defines its own document templates and placeholders.
"""
from typing import Dict, List


INDUSTRIES: Dict[str, Dict] = {
    "gas_engineering": {
        "id": "gas_engineering",
        "name": "Inginerie gaze naturale",
        "tagline": "Documentații pentru branșamente, extinderi și instalații gaze naturale",
        "status": "active",
        "subdomains": [
            {"id": "bransamente_gaz", "name": "Branșamente gaze naturale", "active": True,
             "description": "Branșamente noi gaze naturale către consumatori casnici și non-casnici."},
            {"id": "instalatii_utilizare", "name": "Instalații utilizare gaze naturale", "active": True,
             "description": "Instalații interioare de utilizare în clădiri rezidențiale și comerciale."},
            {"id": "extinderi_conducta", "name": "Extinderi de conductă gaze naturale", "active": True,
             "description": "Lucrări de extindere a rețelei de distribuție gaze naturale."},
            {"id": "studii_fezabilitate", "name": "Studii de fezabilitate", "active": True,
             "description": "Studii tehnico-economice pentru lucrări de gaze."},
            {"id": "inlocuiri_modernizari", "name": "Înlocuiri, reabilitări, modernizări", "active": True,
             "description": "Lucrări de modernizare rețele și instalații existente."},
        ],
    },
    "electrical_engineering": {
        "id": "electrical_engineering",
        "name": "Inginerie electrică",
        "tagline": "Documentații pentru rețele electrice de joasă, medie și înaltă tensiune",
        "status": "coming_soon",
        "subdomains": [
            {"id": "bransamente_electric", "name": "Branșamente electrice", "active": False},
            {"id": "instalatii_electrice", "name": "Instalații electrice", "active": False},
            {"id": "extinderi_retea_electrica", "name": "Extinderi rețea electrică", "active": False},
        ],
    },
    "water_sewage": {
        "id": "water_sewage",
        "name": "Apă și canalizare",
        "tagline": "Documentații pentru rețele de apă potabilă și canalizare",
        "status": "coming_soon",
        "subdomains": [
            {"id": "bransamente_apa", "name": "Branșamente apă", "active": False},
            {"id": "racord_canalizare", "name": "Racorduri canalizare", "active": False},
            {"id": "extinderi_retea_apa", "name": "Extinderi rețea apă", "active": False},
        ],
    },
    "civil_engineering": {
        "id": "civil_engineering",
        "name": "Construcții civile",
        "tagline": "Documentații pentru construcții civile și autorizații",
        "status": "coming_soon",
        "subdomains": [
            {"id": "autorizatii_construire", "name": "Autorizații construire", "active": False},
        ],
    },
    "telecom": {
        "id": "telecom",
        "name": "Telecomunicații",
        "tagline": "Documentații pentru rețele de telecomunicații",
        "status": "coming_soon",
        "subdomains": [
            {"id": "retele_fibra", "name": "Rețele fibră optică", "active": False},
        ],
    },
}


def list_industries() -> List[Dict]:
    return list(INDUSTRIES.values())


def get_industry(industry_id: str) -> Dict:
    return INDUSTRIES.get(industry_id, INDUSTRIES["gas_engineering"])


def get_subdomain(industry_id: str, subdomain_id: str) -> Dict:
    ind = get_industry(industry_id)
    for sd in ind.get("subdomains", []):
        if sd["id"] == subdomain_id:
            return sd
    return {"id": subdomain_id, "name": subdomain_id, "active": False}


def is_active(industry_id: str, subdomain_id: str = None) -> bool:
    ind = get_industry(industry_id)
    if ind.get("status") != "active":
        return False
    if subdomain_id is None:
        return True
    return get_subdomain(industry_id, subdomain_id).get("active", False)


# Default selection on registration
DEFAULT_INDUSTRY = "gas_engineering"
DEFAULT_SUBDOMAIN = "bransamente_gaz"
