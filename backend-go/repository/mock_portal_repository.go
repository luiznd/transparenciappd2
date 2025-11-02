package repository

import (
    "fmt"
    "solid_react_golang_mongo_project/backend-go/model"
    "go.mongodb.org/mongo-driver/bson"
)

type mockPortalRepository struct {
    portals []model.Portal
}

func NewMockPortalRepository() PortalRepository {
	return &mockPortalRepository{
		portals: []model.Portal{
			{
				ID:                              "1",
				Referencia:                      "10-11-2024",
				Portal:                          "transparencia_al",
				Esfera:                          "ESTADUAL",
				MesAnoEnvio:                     "11/2024",
				MesAnoReferencia:                "08/2024",
				VolumeFonte:                     70655,
				VolumetriaDados:                 67702,
				VolumetriaServicos:              67701,
				IndiceDados:                     95.637,
				IndiceServicos:                  99.999,
				VolumeCpfsUnicosDados:           1200,
				VolumeCpfsUnicosServicos:        1150,
				MediaMovelCpfsUnicos:            1000,
				UltimoMesEnviado:                "10/2024",
				UltimaReferencia:                "08/2024",
				UltimaVolumetriaEnviada:         69000,
				MediaMovelUltimos12Meses:        67000,
				Media:                           68000,
				Minimo:                          65000,
				MesCompetenciaMinimo:            "06/2024",
				Maximo:                          71000,
				MesCompetenciaMaximo:            "07/2024",
				PercentualVolumetriaUltima:      102.5,
				PercentualVolumetriaMediaMovel:  98.5,
				PercentualVolumetriaMedia:       99.5,
				PercentualVolumetriaMinimo:      103.5,
				PercentualVolumetriaMaximo:      95.6,
				PulouCompetencia:                false,
				DefasagemNosDados:               false,
				NovosDados:                      true,
				Status:                          "OK",
				ObservacaoTimeDados:             "Nenhuma",
				Enviar:                          true,
			},
			{
				ID:                              "2",
				Referencia:                      "10-11-2024",
				Portal:                          "transparencia_sp",
				Esfera:                          "MUNICIPAL",
				MesAnoEnvio:                     "11/2024",
				MesAnoReferencia:                "09/2024",
				VolumeFonte:                     80000,
				VolumetriaDados:                 78000,
				VolumetriaServicos:              75000,
				IndiceDados:                     96.0,
				IndiceServicos:                  98.0,
				VolumeCpfsUnicosDados:           1300,
				VolumeCpfsUnicosServicos:        1200,
				MediaMovelCpfsUnicos:            1050,
				UltimoMesEnviado:                "10/2024",
				UltimaReferencia:                "09/2024",
				UltimaVolumetriaEnviada:         75000,
				MediaMovelUltimos12Meses:        72000,
				Media:                           74000,
				Minimo:                          70000,
				MesCompetenciaMinimo:            "05/2024",
				Maximo:                          78000,
				MesCompetenciaMaximo:            "06/2024",
				PercentualVolumetriaUltima:      101.0,
				PercentualVolumetriaMediaMovel:  98.0,
				PercentualVolumetriaMedia:       99.0,
				PercentualVolumetriaMinimo:      102.0,
				PercentualVolumetriaMaximo:      97.0,
				PulouCompetencia:                false,
				DefasagemNosDados:               true,
				NovosDados:                      false,
				Status:                          "WARNING",
				ObservacaoTimeDados:             "Revisar dados",
				Enviar:                          true,
			},
			{
				ID:                              "3",
				Referencia:                      "10-11-2024",
				Portal:                          "transparencia_rj",
				Esfera:                          "ESTADUAL",
				MesAnoEnvio:                     "11/2024",
				MesAnoReferencia:                "08/2024",
				VolumeFonte:                     76000,
				VolumetriaDados:                 74000,
				VolumetriaServicos:              72000,
				IndiceDados:                     94.0,
				IndiceServicos:                  96.0,
				VolumeCpfsUnicosDados:           1250,
				VolumeCpfsUnicosServicos:        1180,
				MediaMovelCpfsUnicos:            1100,
				UltimoMesEnviado:                "09/2024",
				UltimaReferencia:                "08/2024",
				UltimaVolumetriaEnviada:         74000,
				MediaMovelUltimos12Meses:        70000,
				Media:                           71000,
				Minimo:                          69000,
				MesCompetenciaMinimo:            "06/2024",
				Maximo:                          76000,
				MesCompetenciaMaximo:            "07/2024",
				PercentualVolumetriaUltima:      103.0,
				PercentualVolumetriaMediaMovel:  97.5,
				PercentualVolumetriaMedia:       99.3,
				PercentualVolumetriaMinimo:      104.0,
				PercentualVolumetriaMaximo:      96.8,
				PulouCompetencia:                true,
				DefasagemNosDados:               false,
				NovosDados:                      true,
				Status:                          "OK",
				ObservacaoTimeDados:             "",
				Enviar:                          true,
			},
			{
				ID:                              "4",
				Referencia:                      "10-11-2024",
				Portal:                          "transparencia_mg",
				Esfera:                          "MUNICIPAL",
				MesAnoEnvio:                     "10/2024",
				MesAnoReferencia:                "08/2024",
				VolumeFonte:                     72000,
				VolumetriaDados:                 71000,
				VolumetriaServicos:              70000,
				IndiceDados:                     92.0,
				IndiceServicos:                  95.0,
				VolumeCpfsUnicosDados:           1150,
				VolumeCpfsUnicosServicos:        1120,
				MediaMovelCpfsUnicos:            1090,
				UltimoMesEnviado:                "08/2024",
				UltimaReferencia:                "08/2024",
				UltimaVolumetriaEnviada:         71000,
				MediaMovelUltimos12Meses:        69000,
				Media:                           70000,
				Minimo:                          68000,
				MesCompetenciaMinimo:            "05/2024",
				Maximo:                          73000,
				MesCompetenciaMaximo:            "06/2024",
				PercentualVolumetriaUltima:      100.5,
				PercentualVolumetriaMediaMovel:  99.2,
				PercentualVolumetriaMedia:       98.8,
				PercentualVolumetriaMinimo:      101.5,
				PercentualVolumetriaMaximo:      95.9,
				PulouCompetencia:                false,
				DefasagemNosDados:               true,
				NovosDados:                      false,
				Status:                          "WARNING",
				ObservacaoTimeDados:             "Verificar",
				Enviar:                          true,
			},
			{
				ID:                              "5",
				Referencia:                      "10-11-2024",
				Portal:                          "transparencia_pr",
				Esfera:                          "ESTADUAL",
				MesAnoEnvio:                     "11/2024",
				MesAnoReferencia:                "09/2024",
				VolumeFonte:                     85000,
				VolumetriaDados:                 82000,
				VolumetriaServicos:              80000,
				IndiceDados:                     97.5,
				IndiceServicos:                  99.2,
				VolumeCpfsUnicosDados:           1400,
				VolumeCpfsUnicosServicos:        1350,
				MediaMovelCpfsUnicos:            1200,
				UltimoMesEnviado:                "10/2024",
				UltimaReferencia:                "09/2024",
				UltimaVolumetriaEnviada:         80000,
				MediaMovelUltimos12Meses:        78000,
				Media:                           79000,
				Minimo:                          75000,
				MesCompetenciaMinimo:            "04/2024",
				Maximo:                          85000,
				MesCompetenciaMaximo:            "08/2024",
				PercentualVolumetriaUltima:      102.5,
				PercentualVolumetriaMediaMovel:  105.1,
				PercentualVolumetriaMedia:       103.8,
				PercentualVolumetriaMinimo:      109.3,
				PercentualVolumetriaMaximo:      96.5,
				PulouCompetencia:                false,
				DefasagemNosDados:               false,
				NovosDados:                      true,
				Status:                          "OK",
				ObservacaoTimeDados:             "Dados atualizados",
				Enviar:                          true,
			},
		},
	}
}

func (r *mockPortalRepository) InsertPortal(portal model.Portal) error {
	r.portals = append(r.portals, portal)
	return nil
}

func (r *mockPortalRepository) GetAllPortals() ([]model.Portal, error) {
    return r.portals, nil
}

func (r *mockPortalRepository) GetPortalByID(id string) (model.Portal, error) {
    for _, p := range r.portals {
        if p.ID == id { // busca simples pelo campo ID
            return p, nil
        }
    }
    return model.Portal{}, fmt.Errorf("portal não encontrado: %s", id)
}

// UpdatePortalFields atualiza campos específicos em memória para o mock
func (r *mockPortalRepository) UpdatePortalFields(id string, fields bson.M) error {
    for i, p := range r.portals {
        if p.ID == id {
            if v, ok := fields["observacaoTimeDados"].(string); ok {
                r.portals[i].ObservacaoTimeDados = v
            }
            if v, ok := fields["enviar"].(bool); ok {
                r.portals[i].Enviar = v
            }
            if v, ok := fields["status"].(string); ok {
                r.portals[i].Status = v
            }
            if v, ok := fields["pulouCompetencia"].(bool); ok {
                r.portals[i].PulouCompetencia = v
            }
            if v, ok := fields["defasagemNosDados"].(bool); ok {
                r.portals[i].DefasagemNosDados = v
            }
            if v, ok := fields["novosDados"].(bool); ok {
                r.portals[i].NovosDados = v
            }
            return nil
        }
    }
    return fmt.Errorf("portal não encontrado: %s", id)
}