package com.wexinc

import io.micronaut.test.extensions.spock.annotation.MicronautTest
import jakarta.inject.Inject
import spock.lang.Specification

@MicronautTest
class PersonServiceImplSpec extends Specification {

    @Inject
    PersonService personService

    def "test the service can get a name"() {
        expect:
        personService.getPerson().name
    }

    def "validate that no exception is thrown"() {
        when:
        personService.doWork()

        then:
        notThrown(Exception)
    }
}