import Customer from "../../customer/entity/customer";
import CostumerAddressChangedEvent from "../../customer/event/costumer-address-changed.event";
import CostumerCreatedEvent from "../../customer/event/costumer-created.event";
import EnviaConsoleLog1Handler from "../../customer/event/handler/envia.console.log1.handler";
import EnviaConsoleLog2Handler from "../../customer/event/handler/envia.console.log2.handler";
import SendMessageWhenCostumerAddressIsChanged from "../../customer/event/handler/send-message-when-costumer-address-is-changed.handler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("should register the CostumerCreatedEvent handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new EnviaConsoleLog1Handler();
    const eventHandler2 = new EnviaConsoleLog2Handler();

    eventDispatcher.register("CostumerCreatedEvent", eventHandler1);
    eventDispatcher.register("CostumerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CostumerCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["CostumerCreatedEvent"].length).toBe(
      2
    );
    expect(
      eventDispatcher.getEventHandlers["CostumerCreatedEvent"][0]
    ).toMatchObject(eventHandler1);
    expect(
      eventDispatcher.getEventHandlers["CostumerCreatedEvent"][1]
    ).toMatchObject(eventHandler2);

    const spy = jest.spyOn(global.console, 'log')
    const customer = new Customer("1", "Test");
    const event = new CostumerCreatedEvent(customer);
    eventDispatcher.notify(event);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith("Esse é o primeiro console.log do evento: CustomerCreated")
    expect(spy).toHaveBeenCalledWith("Esse é o segundo console.log do evento: CustomerCreated")

  });

  it("should register the CostumerAddressChangedEvent handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendMessageWhenCostumerAddressIsChanged();

    eventDispatcher.register("CostumerAddressChangedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CostumerAddressChangedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["CostumerAddressChangedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["CostumerAddressChangedEvent"][0]
    ).toMatchObject(eventHandler);

    const spy = jest.spyOn(global.console, 'log')
    const customer = new Customer("1", "Test");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);

    const event = new CostumerAddressChangedEvent(customer);
    eventDispatcher.notify(event);
  
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${address.toString()}`);
  });
});
