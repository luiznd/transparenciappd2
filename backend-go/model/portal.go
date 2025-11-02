package model

type Portal struct {
	ID                             string  `json:"_id" bson:"_id,omitempty"`
	Referencia                     string  `json:"referencia"`
	Portal                         string  `json:"portal"`
	Esfera                         string  `json:"esfera"`
	MesAnoEnvio                    string  `json:"mesAnoEnvio"`
	MesAnoReferencia               string  `json:"mesAnoReferencia"`
	VolumeFonte                    int     `json:"volumeFonte"`
	VolumetriaDados                int     `json:"volumetriaDados"`
	VolumetriaServicos             int     `json:"volumetriaServicos"`
	IndiceDados                    float64 `json:"indiceDados"`
	IndiceServicos                 float64 `json:"indiceServicos"`
	VolumeCpfsUnicosDados          int     `json:"volumeCpfsUnicosDados"`
	VolumeCpfsUnicosServicos       int     `json:"volumeCpfsUnicosServicos"`
	MediaMovelCpfsUnicos           int     `json:"mediaMovelCpfsUnicos"`
	UltimoMesEnviado               string  `json:"ultimoMesEnviado"`
	UltimaReferencia               string  `json:"ultimaReferencia"`
	UltimaVolumetriaEnviada        int     `json:"ultimaVolumetriaEnviada"`
	MediaMovelUltimos12Meses       int     `json:"mediaMovelUltimos12Meses"`
	Media                          int     `json:"media"`
	Minimo                         int     `json:"minimo"`
	MesCompetenciaMinimo           string  `json:"mesCompetenciaMinimo"`
	Maximo                         int     `json:"maximo"`
	MesCompetenciaMaximo           string  `json:"mesCompetenciaMaximo"`
	PercentualVolumetriaUltima     float64 `json:"percentualVolumetriaUltima"`
	PercentualVolumetriaMediaMovel float64 `json:"percentualVolumetriaMediaMovel"`
	PercentualVolumetriaMedia      float64 `json:"percentualVolumetriaMedia"`
	PercentualVolumetriaMinimo     float64 `json:"percentualVolumetriaMinimo"`
	PercentualVolumetriaMaximo     float64 `json:"percentualVolumetriaMaximo"`
	PulouCompetencia               bool    `json:"pulouCompetencia"`
	DefasagemNosDados              bool    `json:"defasagemNosDados"`
	NovosDados                     bool    `json:"novosDados"`
	Status                         string  `json:"status"`
	ObservacaoTimeDados            string  `json:"observacaoTimeDados"`
	Enviar                         bool    `json:"enviar"`
}
