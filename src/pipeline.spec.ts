import { EventBridgeEvent } from "aws-lambda";
import { initPipeline } from "./pipeline"

interface Thing {
  foo: string;
}

interface Thing2 {
  bar: string;
}

interface Thing3 {
  baz: string;
}

type IncomingEvent =
  | EventBridgeEvent<"foo", Thing>
  | EventBridgeEvent<"fo2o", Thing>
  | EventBridgeEvent<"anotherEvent", Thing2>
  | EventBridgeEvent<"event", Thing3>;

describe("the event pipeline builder", () => {
  it("executes the correct handler", () => {

    const mockEvent: IncomingEvent= {
      id: '123',
      version: 'a',
      account: 'a',
      time: 'a',
      region: 'a',
      resources: ['a'],
      source: 'a',
      'detail-type': 'anotherEvent',
      detail: {
        bar: 'foo'
      }
    }

    const handlerOne = (key: 'foo', event: EventBridgeEvent<'foo', Thing>) => fail('Handler one was not supposed to be called')
    const handlerTwo = (key: 'fo2o', event: EventBridgeEvent<'fo2o', Thing>) => fail('Handler two was not supposed to be called')
    const handlerThree = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => expect(event).toBe(mockEvent)
    const handlerFour = (key: 'event', event: EventBridgeEvent<'event', Thing3>) => fail('Handler four was not supposed to be called')

    const { execute, step } = initPipeline(mockEvent as IncomingEvent)

    execute(
      step('foo', handlerOne),
      step('fo2o', handlerTwo),
      step('anotherEvent', handlerThree),
      step('event', handlerFour)
    )

    expect.assertions(1)
  })

  it("errors at build time if not all the events are handled", () => {
    const mockEvent: IncomingEvent= {
      id: '123',
      version: 'a',
      account: 'a',
      time: 'a',
      region: 'a',
      resources: ['a'],
      source: 'a',
      'detail-type': 'anotherEvent',
      detail: {
        bar: 'foo'
      }
    }

    const handlerOne = (key: 'foo', event: EventBridgeEvent<'foo', Thing>) => undefined
    const handlerTwo = (key: 'fo2o', event: EventBridgeEvent<'fo2o', Thing>) => undefined
    const handlerThree = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => undefined

    const { execute, step } = initPipeline(mockEvent as IncomingEvent)

    execute(
      // @ts-expect-error
      step('foo', handlerOne),
      step('fo2o', handlerTwo),
      step('anotherEvent', handlerThree),
    )
  })

  it("errors at build time if a key is used that doesn't exist", () => {
    const mockEvent: IncomingEvent= {
      id: '123',
      version: 'a',
      account: 'a',
      time: 'a',
      region: 'a',
      resources: ['a'],
      source: 'a',
      'detail-type': 'anotherEvent',
      detail: {
        bar: 'foo'
      }
    }

    const handlerOne = (key: 'foo', event: EventBridgeEvent<'foo', Thing>) => undefined
    const handlerTwo = (key: 'fo2o', event: EventBridgeEvent<'fo2o', Thing>) => undefined
    const handlerThree = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => undefined 
    const handlerFour = (key: 'event', event: EventBridgeEvent<'event', Thing3>) => undefined 

    const { execute, step } = initPipeline(mockEvent as IncomingEvent)

    execute(
      // @ts-expect-error
      step('foo0', handlerOne),
      step('fo2o', handlerTwo),
      step('anotherEvent', handlerThree),
      step('event', handlerFour)
    )
  })

  it("errors at build time if keys and handlers are mismatched", () => {
    const mockEvent: IncomingEvent= {
      id: '123',
      version: 'a',
      account: 'a',
      time: 'a',
      region: 'a',
      resources: ['a'],
      source: 'a',
      'detail-type': 'anotherEvent',
      detail: {
        bar: 'foo'
      }
    }

    const handlerOne = (key: 'foo', event: EventBridgeEvent<'foo', Thing>) => undefined
    const handlerTwo = (key: 'fo2o', event: EventBridgeEvent<'fo2o', Thing>) => undefined
    const handlerThree = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => undefined 
    const handlerFour = (key: 'event', event: EventBridgeEvent<'event', Thing3>) => undefined 

    const { execute, step } = initPipeline(mockEvent as IncomingEvent)

    execute(
      // @ts-expect-error
      step('anotherEvent', handlerOne),
      step('fo2o', handlerTwo),
      step('anotherEvent', handlerThree),
      step('event', handlerFour)
    )
  })

  it("errors at build time if the type is mismatched from the key in the handler event", () => {
    const mockEvent: IncomingEvent= {
      id: '123',
      version: 'a',
      account: 'a',
      time: 'a',
      region: 'a',
      resources: ['a'],
      source: 'a',
      'detail-type': 'anotherEvent',
      detail: {
        bar: 'foo'
      }
    }

    const handlerOne = (key: 'foo', event: EventBridgeEvent<'foo', Thing3>) => undefined
    const handlerTwo = (key: 'fo2o', event: EventBridgeEvent<'fo2o', Thing>) => undefined
    const handlerThree = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => undefined 
    const handlerFour = (key: 'event', event: EventBridgeEvent<'event', Thing3>) => undefined 

    const { execute, step } = initPipeline(mockEvent as IncomingEvent)

    execute(
      // @ts-expect-error
      step('foo', handlerOne),
      step('fo2o', handlerTwo),
      step('anotherEvent', handlerThree),
      step('event', handlerFour)
    )
  })

  it("compiles fine when multiple keys have the same handler", () => {
    const mockEvent: IncomingEvent= {
      id: '123',
      version: 'a',
      account: 'a',
      time: 'a',
      region: 'a',
      resources: ['a'],
      source: 'a',
      'detail-type': 'anotherEvent',
      detail: {
        bar: 'foo'
      }
    }

    const handlerOne = (key: 'foo' | 'fo2o', event: EventBridgeEvent<'foo' | 'fo2o', Thing>) => undefined
    const handlerThree = (key: 'anotherEvent', event: EventBridgeEvent<'anotherEvent', Thing2>) => undefined 
    const handlerFour = (key: 'event', event: EventBridgeEvent<'event', Thing3>) => undefined 

    const { execute, step } = initPipeline(mockEvent as IncomingEvent)

    execute(
      step('foo', handlerOne),
      step('fo2o', handlerOne),
      step('anotherEvent', handlerThree),
      step('event', handlerFour)
    )
  })
});
