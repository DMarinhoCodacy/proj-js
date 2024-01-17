package com.codacy.listener.http.routes

import cats.effect._
import org.typelevel.log4cats.{LoggerFactory, SelfAwareStructuredLogger}
import com.codacy.listener.service.specification.definitions.HealthCheck
import com.codacy.listener.service.specification.healthCheck.HealthCheckResource.HealthCheckResponse
import org.typelevel.log4cats.slf4j._

object HealthCheckHandler extends com.codacy.listener.service.specification.healthCheck.HealthCheckHandler[IO] {

  private val logger: SelfAwareStructuredLogger[IO] = LoggerFactory[IO].getLogger

  override def healthCheck(respond: HealthCheckResponse.type)(): IO[HealthCheckResponse] =
    for {
      _ <- logger.debug("I'm all good, thank you")
    } yield respond.Ok(HealthCheck("I'm all good, thank you"))

}
object HealthCheckHandler extends com.codacy.listener.service.specification.healthCheck.HealthCheckHandler[IO] {

  private val logger: SelfAwareStructuredLogger[IO] = LoggerFactory[IO].getLogger

  override def healthCheck(respond: HealthCheckResponse.type)(): IO[HealthCheckResponse] =
    for {
      _ <- logger.debug("I'm all good, thank you")
    } yield respond.Ok(HealthCheck("I'm all good, thank you"))

}
object HealthCheckHandler extends com.codacy.listener.service.specification.healthCheck.HealthCheckHandler[IO] {

  private val logger: SelfAwareStructuredLogger[IO] = LoggerFactory[IO].getLogger

  override def healthCheck(respond: HealthCheckResponse.type)(): IO[HealthCheckResponse] =
    for {
      _ <- logger.debug("I'm all good, thank you")
    } yield respond.Ok(HealthCheck("I'm all good, thank you"))

}
object HealthCheckHandler extends com.codacy.listener.service.specification.healthCheck.HealthCheckHandler[IO] {

  private val logger: SelfAwareStructuredLogger[IO] = LoggerFactory[IO].getLogger

  override def healthCheck(respond: HealthCheckResponse.type)(): IO[HealthCheckResponse] =
    for {
      _ <- logger.debug("I'm all good, thank you")
    } yield respond.Ok(HealthCheck("I'm all good, thank you"))

}