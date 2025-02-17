# pip install OpenFisca-Country-Template
from openfisca_core.simulation_builder import SimulationBuilder
from openfisca_country_template import CountryTaxBenefitSystem
demo_tax_benefit_system = CountryTaxBenefitSystem()

population = {
    "persons": {
        "Alice": {  # set the value for each month of the 12 from January 2022 on
            "salary": { "month:2022-01:12": 60000 }
        }
    }
}

simulation = SimulationBuilder().build_from_entities(demo_tax_benefit_system, population)
print("Alice’s taxes for November 2022", simulation.calculate("total_taxes", "2022-11"))
print("Alice’s total taxes for 2022", simulation.calculate_add("total_taxes", "2022"))