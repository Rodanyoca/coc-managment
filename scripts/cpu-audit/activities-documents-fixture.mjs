import { activityDashboardFixture } from './dashboard-fixture.mjs'

export async function activityDetailFixture(root, count = 10000) {
  const f = await activityDashboardFixture(root, count)
  const entityHeaders = ['id_activite_entite', 'id_activite', 'id_entite', 'id_role_entite_activite', 'observation']
  const participantHeaders = ['id_participation', 'id_activite', 'id_acteur_coc', 'id_type_acteur', 'id_activite_entite', 'observation']
  f.put('ACTIVITIES', 'ACTIVITES_ENTITES', [entityHeaders, ...Array.from({length: count}, (_, i) => [`E${i}`, ` A${i % 200} `, 'E1', 'R1', 'synthetic'])])
  f.put('ACTIVITIES', 'ACTIVITES_PARTICIPANTS', [participantHeaders, ...Array.from({length: count}, (_, i) => [`P${i}`, ` A${i % 200} `, `ACT${i}`, 'TYPACT001', `E${i}`, 'synthetic'])])
  return {...f, detail: async () => {
    const [activity, entities, participants] = await Promise.all([f.data.getActivity('A123'), f.data.getActivityEntities('A123'), f.data.getParticipants('A123')])
    return {activity, entities, participants}
  }}
}
