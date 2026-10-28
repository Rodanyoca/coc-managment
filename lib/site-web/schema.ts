export type ContentRow = Record<string, string>
export type FieldType = "text" | "long" | "date" | "number" | "boolean" | "status" | "relation" | "image" | "pdf" | "url"
export type ContentField = { key: string; label: string; type: FieldType; required?: boolean; relation?: Resource; group?: string }
export type ContentSchema = { title: string; singular: string; sheet: string; id: string; label: string; fields: ContentField[] }
const field = (key: string, label: string, type: FieldType = "text", required = false): ContentField => ({ key, label, type, required })
const status = field("id_statut_publication", "Statut de publication", "status", true)
const order = field("ordre_affichage", "Ordre d’affichage", "number")
const featured = field("est_mis_en_avant", "À la une", "boolean")
const title = field("titre", "Titre", "text", true)
const description = field("description", "Description", "long")
const publication = [status, featured, order]
export type Resource = "sliders" | "evenements" | "communiques" | "actualites" | "athletes" | "galeries" | "photos" | "documents" | "categories"
export const CONTENT_SCHEMAS: Record<Resource, ContentSchema> = {
  sliders: { title: "Sliders", singular: "un slider", sheet: "SLIDERS_SITE", id: "id_slide", label: "titre", fields: [title, field("description", "Description", "long", true), field("image_url", "Image", "image"), field("libelle_bouton", "Libellé du bouton"), field("lien_bouton", "Lien du bouton", "url"), order, status, field("date_debut_publication", "Début de publication", "date"), field("date_fin_publication", "Fin de publication", "date")] },
  evenements: { title: "Événements à la une", singular: "un événement", sheet: "ACTIVITES_PUBLIQUES", id: "id_evenement_public", label: "titre", fields: [title, field("type_evenement", "Type d’événement"), field("date_debut", "Date de début", "date", true), field("date_fin", "Date de fin", "date"), field("lieu", "Lieu"), description, field("image_url", "Image d’illustration", "image"), status, field("logo_url", "Logo de l’événement", "image"), featured, order] },
  communiques: { title: "Communiqués", singular: "un communiqué", sheet: "COMMUNIQUES_SITE", id: "id_communique", label: "titre", fields: [field("date_publication", "Date de publication", "date", true), title, field("extrait", "Description courte", "long"), field("contenu", "Texte intégral", "long"), field("fichier_url", "Ancien lien direct (facultatif)", "url"), ...publication, { key: "id_document_public", label: "Document public", type: "relation", relation: "documents" }] },
  actualites: { title: "Actualités", singular: "une actualité", sheet: "ACTUALITES_SITE", id: "id_actualite", label: "titre", fields: [title, { key: "id_categorie_actualite", label: "Catégorie", type: "relation", relation: "categories", required: true }, field("date_publication", "Date de publication", "date", true), field("extrait", "Description courte", "long"), field("contenu", "Texte intégral", "long"), field("image_url", "Image principale", "image"), field("auteur", "Auteur"), ...publication, { key: "id_galerie", label: "Galerie associée", type: "relation", relation: "galeries" }] },
  athletes: { title: "Athlètes mis en avant", singular: "un athlète public", sheet: "ATHLETES_PUBLICS", id: "id_athlete_public", label: "nom_complet", fields: [field("nom_complet", "Nom complet", "text", true), field("sexe", "Sexe"), field("sport", "Sport", "text", true), field("discipline", "Discipline"), field("photo_url", "Photo", "image"), field("biographie_courte", "Biographie courte", "long"), field("est_olympien", "Olympien (information vérifiée)", "boolean"), featured, order, status, field("distinction", "Distinction factuelle validée")] },
  galeries: { title: "Galeries", singular: "une galerie", sheet: "GALERIES_SITE", id: "id_galerie", label: "titre", fields: [title, description, field("date_evenement", "Date de l’événement", "date"), field("image_couverture_url", "Image de couverture", "image"), ...publication] },
  photos: { title: "Photos de la galerie", singular: "une photo", sheet: "MEDIAS_GALERIE_SITE", id: "id_media_galerie", label: "titre_media", fields: [{ key: "id_galerie", label: "Galerie", type: "relation", relation: "galeries", required: true }, field("type_media", "Type de média"), field("titre_media", "Titre de la photo", "text", true), field("fichier_url", "Photo", "image"), field("legende", "Description de la photo", "long"), field("credit", "Crédit photo"), order] },
  documents: { title: "Documents publics", singular: "un document public", sheet: "DOCUMENTS_PUBLICS", id: "id_document_public", label: "titre", fields: [field("type_document", "Type de document", "text", true), title, field("date_document", "Date du document", "date", true), description, field("fichier_url", "Fichier PDF", "pdf"), status] },
  categories: { title: "Catégories d’actualités", singular: "une catégorie", sheet: "CATEGORIES_ACTUALITES", id: "id_categorie_actualite", label: "nom_categorie_actualite", fields: [field("nom_categorie_actualite", "Nom de la catégorie", "text", true), field("observation", "Observation", "long")] },
}
export const isResource = (value: string): value is Resource => Object.hasOwn(CONTENT_SCHEMAS, value)
export const headersFor = (resource: Resource) => [CONTENT_SCHEMAS[resource].id, ...CONTENT_SCHEMAS[resource].fields.map(f => f.key)]
export const isTrue = (value: string) => /^(true|vrai|oui|1)$/i.test(value)
export type PublicationStatus = { id: string; label: string }
export type RelationOption = { id: string; label: string; status?: string }
export type RelationOptions = Partial<Record<Resource, RelationOption[]>>
