
package service

import (
    "log"
    "solid_react_golang_mongo_project/backend-go/model"
    "solid_react_golang_mongo_project/backend-go/repository"
    "go.mongodb.org/mongo-driver/bson"
)

type PortalService interface {
    InitializeData() error
    GetAllPortals() ([]model.Portal, error)
    GetPortalByID(id string) (model.Portal, error)
    UpdatePortalFields(id string, observacaoTimeDados string, enviar bool) error
    UpdatePortalFieldsMap(id string, fields bson.M) error
}

type portalService struct {
    repo repository.PortalRepository
}

func NewPortalService(repo repository.PortalRepository) PortalService {
    return &portalService{repo: repo}
}

func (s *portalService) InitializeData() error {
    data := []model.Portal{
        {Portal: "transparencia_al", Esfera: "ESTADUAL", MesAnoEnvio: "11/2024"},
        // Populate other fields based on extracted data
    }
    for _, portal := range data {
        err := s.repo.InsertPortal(portal)
        if err != nil {
            log.Println("Error inserting initial data:", err)
            return err
        }
    }
    return nil
}

func (s *portalService) GetAllPortals() ([]model.Portal, error) {
    return s.repo.GetAllPortals()
}

func (s *portalService) GetPortalByID(id string) (model.Portal, error) {
    return s.repo.GetPortalByID(id)
}

// UpdatePortalFields atualiza campos editáveis do Portal
func (s *portalService) UpdatePortalFields(id string, observacaoTimeDados string, enviar bool) error {
    fields := bson.M{
        "observacaoTimeDados": observacaoTimeDados,
        "enviar":               enviar,
    }
    return s.repo.UpdatePortalFields(id, fields)
}

// UpdatePortalFieldsMap permite atualizar um conjunto de campos editáveis
func (s *portalService) UpdatePortalFieldsMap(id string, fields bson.M) error {
    return s.repo.UpdatePortalFields(id, fields)
}
