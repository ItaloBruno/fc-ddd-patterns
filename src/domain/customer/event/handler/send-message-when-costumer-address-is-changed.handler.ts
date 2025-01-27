import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CostumerAddressChangedEvent from "../costumer-address-changed.event";



export default class SendMessageWhenCostumerAddressIsChanged
  implements EventHandlerInterface<CostumerAddressChangedEvent>
{
  handle(event: CostumerAddressChangedEvent): void {
    const costumerId = event.eventData.id
    const costumerName = event.eventData.name
    const newCostumerAddress = event.eventData.Address

    console.log(`Endereço do cliente: ${costumerId}, ${costumerName} alterado para: ${newCostumerAddress.toString()}`); 
  }
}
