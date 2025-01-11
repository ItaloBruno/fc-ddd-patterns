import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });
  
  it("should update a order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const secondProduct = new Product("12345", "Product 2", 20);
    await productRepository.create(secondProduct);
    
    const secondOrderItem = new OrderItem(
      "2",
      secondProduct.name,
      secondProduct.price,
      secondProduct.id,
      3
    );

    order.addNewOrderItem(secondOrderItem);
    await orderRepository.update(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: 80,
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
        {
          id: secondOrderItem.id,
          name: secondOrderItem.name,
          price: secondOrderItem.price,
          quantity: secondOrderItem.quantity,
          order_id: "123",
          product_id: "12345",
        },
      ],
    });
  });

  it("should find a specific order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const firstItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const secondProduct = new Product("12345", "Product 2", 20);
    await productRepository.create(secondProduct);
    
    const secondOrderItem = new OrderItem(
      "2",
      secondProduct.name,
      secondProduct.price,
      secondProduct.id,
      3
    );


    const order = new Order("123", "123", [firstItem, secondOrderItem]);
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const recoveredOrder = await orderRepository.find(order.id);

    expect(order).toStrictEqual(recoveredOrder)
  });

  it("should find all orders", async () => {

    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    // Primeiro pedido
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product("1", "Product 1", 10);
    await productRepository.create(product);

    const firstItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const firstOrder = new Order("1", "1", [firstItem]);
    await orderRepository.create(firstOrder);

    // Segundo pedido
    const secondCustomer = new Customer("2", "Customer 2");
    const secondAddress = new Address("Street 2", 1, "Zipcode 2", "City 2");
    secondCustomer.changeAddress(secondAddress);
    await customerRepository.create(secondCustomer);

    const secondProduct = new Product("2", "Product 2", 20);
    await productRepository.create(secondProduct);

    const secondItem = new OrderItem(
      "12",
      product.name,
      product.price,
      product.id,
      20
    );

    const secondOrder = new Order("2", "2", [secondItem]);
    await orderRepository.create(secondOrder);

    const recoveredOrders = await orderRepository.findAll();
    expect(recoveredOrders).toHaveLength(2);
    expect(recoveredOrders).toContainEqual(firstOrder);
    expect(recoveredOrders).toContainEqual(secondOrder);
  });

});
